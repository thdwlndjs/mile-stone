import express from "express";
import Parser from "rss-parser";
import fs from "fs";
import path from "path";
import schedule from "node-schedule";
import fetch from "node-fetch";
import iconv from "iconv-lite";
import { parseStringPromise } from "xml2js";
import { format } from "date-fns";

const app = express();
app.use(express.json());

// === 경로 설정 ===
const DATA_DIR = process.cwd();
const RSS_FILE = path.join(DATA_DIR, "rss_list.csv");
const QUEUE_FILE = path.join(DATA_DIR, "articles_queue.csv");
const SEEN_FILE = path.join(DATA_DIR, "seen_urls.csv");
const BACKUP_DIR = path.join(DATA_DIR, "backups");

// === RSS 파서 설정 ===
const parser = new Parser({
    defaultRSS: 2.0,
    headers: { "User-Agent": "Mozilla/5.0 (RSS Collector)" },
    customFields: { item: ["description", "content:encoded"] },
});

// === CSV 헬퍼 ===
function readCSV(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const text = fs.readFileSync(filePath, "utf-8").trim();
    if (!text) return [];
    const lines = text.split("\n").filter(l => l && !l.startsWith("#"));
    const header = lines[0]?.split(",") || [];
    return lines.slice(1).map(line => {
        const cols = line.split(",");
        const row = {};
        header.forEach((h, i) => (row[h.trim()] = cols[i]?.trim() || ""));
        return row;
    });
}

function appendCSV(filePath, header, row) {
    const exists = fs.existsSync(filePath);
    const line = header.map(h => row[h] || "").join(",") + "\n";
    if (!exists) fs.writeFileSync(filePath, header.join(",") + "\n");
    fs.appendFileSync(filePath, line);
}

// === seen_urls 관리 ===
function loadSeen() {
    if (!fs.existsSync(SEEN_FILE)) return new Set();
    const urls = fs.readFileSync(SEEN_FILE, "utf-8").split("\n").filter(Boolean);
    return new Set(urls);
}

// === seen_urls 백업 ===
function rotateSeenFile() {
    if (!fs.existsSync(SEEN_FILE)) return;
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);
    const date = format(new Date(), "yyyy-MM-dd");
    const backupFile = path.join(BACKUP_DIR, `seen_${date}.csv`);
    fs.copyFileSync(SEEN_FILE, backupFile);
    console.log(`💾 seen_urls.csv 백업 완료 → backups/seen_${date}.csv`);
    fs.writeFileSync(SEEN_FILE, ""); // 초기화
}

// === 상태 플래그 ===
let isCollecting = false;

// === RSS 파싱 (2분 초과 스킵 포함) ===
async function safeParseFeed(url, title = "unknown") {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2분 제한

    try {
        const feed = await parser.parseURL(url);
        clearTimeout(timeoutId);
        if (feed?.items?.length > 0) return feed.items;
    } catch (_) { }

    try {
        const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
            signal: controller.signal,
        });

        if (!res.ok) throw new Error(`Status ${res.status}`);
        const buffer = await res.arrayBuffer();

        let text;
        try {
            text = iconv.decode(Buffer.from(buffer), "utf-8");
        } catch {
            text = iconv.decode(Buffer.from(buffer), "euc-kr");
        }

        if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
            const json = JSON.parse(text);
            if (json?.articles) {
                clearTimeout(timeoutId);
                return json.articles.map(a => ({
                    title: a.title || "",
                    link: a.url || "",
                    pubDate: a.date || "",
                }));
            }
        }

        const parsed = await parseStringPromise(text, { explicitArray: false });
        clearTimeout(timeoutId);
        const items =
            parsed?.rss?.channel?.item ||
            parsed?.rss?.channel?.news ||
            parsed?.feed?.entry ||
            [];
        return Array.isArray(items) ? items : [items];
    } catch (err) {
        if (err.name === "AbortError") {
            console.warn(`⏰ [${title}] 응답 지연 → 스킵`);
        } else {
            console.warn(`⚠️ ${url} 파싱 실패: ${err.message}`);
        }
        return [];
    }
}

// === 메인 피드 체크 ===
async function checkFeeds() {
    if (isCollecting) {
        console.log("⏳ 현재 수집 중입니다. (중복 실행 방지)");
        return;
    }

    isCollecting = true;
    const startTime = Date.now();
    console.log(`\n[${new Date().toLocaleTimeString()}] 🔁 RSS 업데이트 확인 시작`);

    const rssList = readCSV(RSS_FILE).filter(r => r.status === "active" || !r.status);
    const total = rssList.length;
    let processed = 0;
    const seen = loadSeen();
    let newCount = 0;

    for (const source of rssList) {
        try {
            const items = await safeParseFeed(source.url, source.title);
            processed++;
            console.log(`📡 [${processed}/${total}] ${source.title} 처리 완료`);

            if (!items || items.length === 0) continue;

            items.forEach(it => {
                const link =
                    it.link?.href || it.link || it.guid || it.id || it.url || "";
                if (!link || seen.has(link)) return;

                const title = it.title || it["title:encoded"] || "(제목 없음)";
                const pubDate =
                    it.pubDate || it.updated || it["dc:date"] || new Date().toISOString();

                const row = {
                    rss_title: source.title,
                    category: source.category || "",
                    country: source.country || "",
                    article_title: title.replace(/,/g, " "),
                    url: link.trim(),
                    published: pubDate,
                    collected_at: new Date().toISOString(),
                    status: "pending",
                };

                // ✅ queue 먼저 append
                appendCSV(
                    QUEUE_FILE,
                    [
                        "rss_title",
                        "category",
                        "country",
                        "article_title",
                        "url",
                        "published",
                        "collected_at",
                        "status",
                    ],
                    row
                );

                // ✅ queue 기록 완료 후 seen에 기록
                fs.appendFileSync(SEEN_FILE, link + "\n");
                seen.add(link);
                newCount++;
            });
        } catch (err) {
            console.log(`⚠️ [${source.title}] RSS 불안정 (${err.message})`);
        }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(
        newCount > 0
            ? `🆕 새 기사 ${newCount}개 기록 완료`
            : "✨ 새 기사 없음"
    );
    console.log(`✅ RSS 수집 완료 (소요시간: ${elapsed}s)\n`);
    isCollecting = false;
}

// === 스케줄러 ===
// 매 정시(1시간 간격)
schedule.scheduleJob("0 * * * *", () => {
    checkFeeds();
});

// 매일 자정에 seen_urls 백업 및 초기화
schedule.scheduleJob("0 0 * * *", () => {
    rotateSeenFile();
});

// === API ===
app.get("/api/rss-check", async (req, res) => {
    if (isCollecting) {
        res.json({ message: "⏳ 현재 RSS 수집 작업이 진행 중입니다." });
        return;
    }
    await checkFeeds();
    res.json({ message: "✅ RSS 업데이트 수집 완료" });
});

app.get("/api/rss-queue", (req, res) => {
    const queue = readCSV(QUEUE_FILE);
    res.json(queue);
});

// === 서버 실행 ===
const PORT = 4100;
app.listen(PORT, () => {
    console.log(`✅ RSS 감시 서버 실행 중: http://localhost:${PORT}`);
    if (!fs.existsSync(SEEN_FILE)) fs.writeFileSync(SEEN_FILE, "");
    if (!fs.existsSync(QUEUE_FILE))
        fs.writeFileSync(
            QUEUE_FILE,
            "rss_title,category,country,article_title,url,published,collected_at,status\n"
        );
    checkFeeds(); // 시작 시 즉시 1회 실행
});
