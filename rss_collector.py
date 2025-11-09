import tkinter as tk
import os, csv

# ---------- 설정 ----------
DATA_DIR = os.path.dirname(os.path.abspath(__file__))
RSS_FILE = os.path.join(DATA_DIR, "rss_list.csv")
CENTRAL_FILE = os.path.join(DATA_DIR, "central_list.csv")

# ---------- 색상 ----------
COLOR_BG = "#D9D9D9"
COLOR_HEADER = "#A6A6A6"
COLOR_LIST = "#FFFEFE"
COLOR_TEXT = "#000000"


# ---------- CSV I/O ----------
def ensure_csv(file_path):
    if not os.path.exists(file_path):
        with open(file_path, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.writer(f)
            writer.writerow(
                ["title", "url", "category", "country", "last_checked", "status"]
            )
    else:
        # ✅ 기존 파일에 country 컬럼이 없으면 자동 추가
        with open(file_path, newline="", encoding="utf-8-sig") as f:
            header = f.readline().strip()
        if "country" not in header:
            lines = []
            with open(file_path, encoding="utf-8-sig") as f:
                lines = f.readlines()
            header_parts = header.split(",")
            if len(header_parts) < 6:
                header_parts.insert(3, "country")
            lines[0] = ",".join(header_parts) + "\n"
            with open(file_path, "w", encoding="utf-8-sig") as f:
                f.writelines(lines)


def read_csv(file_path):
    ensure_csv(file_path)
    items = []
    raw_lines = []
    with open(file_path, newline="", encoding="utf-8-sig") as f:
        for line in f:
            raw_lines.append(line)
            if line.strip().startswith("#") or not line.strip():
                continue
        f.seek(0)
        reader = csv.DictReader(filter(lambda l: not l.strip().startswith("#"), f))
        for row in reader:
            items.append(row)
    return items, raw_lines


def save_csv(file_path, items, raw_lines):
    header = "title,url,category,country,last_checked,status\n"
    with open(file_path, "w", encoding="utf-8-sig") as f:
        for line in raw_lines:
            if line.strip().startswith("#"):
                f.write(line)
        f.write(header)
        for item in items:
            f.write(
                f"{item['title']},{item['url']},{item.get('category','')},{item.get('country','')},{item.get('last_checked','')},{item.get('status','')}\n"
            )


# ---------- 팝업 중앙 배치 ----------
def center_on_screen(win, width=420, height=280):
    win.update_idletasks()
    sw = win.winfo_screenwidth()
    sh = win.winfo_screenheight()
    x = (sw - width) // 2
    y = (sh - height) // 2
    win.geometry(f"{width}x{height}+{x}+{y}")


# ---------- 메인 윈도우 ----------
root = tk.Tk()
root.title("뉴스 수집 프로그램 (CSV + 국가 + 검색 + 정렬)")
root.geometry("1100x800")
root.configure(bg=COLOR_BG)
root.minsize(800, 600)
root.resizable(True, True)

root.grid_rowconfigure(1, weight=1, minsize=300)
root.grid_rowconfigure(2, weight=1, minsize=300)
root.grid_columnconfigure(0, weight=1)

btn_style = {
    "bg": COLOR_HEADER,
    "fg": COLOR_TEXT,
    "activebackground": "#8C8C8C",
    "activeforeground": COLOR_TEXT,
    "font": ("Arial", 10, "bold"),
    "relief": "flat",
    "width": 7,
    "height": 1,
}


# ---------- 섹션 ----------
def create_section(parent, title_text, file_path, row_index):
    section_frame = tk.Frame(parent, bg=COLOR_BG)
    section_frame.grid(row=row_index, column=0, sticky="nsew", padx=20, pady=10)
    parent.grid_rowconfigure(row_index, weight=1, minsize=300)

    # --- 헤더 + 검색창 ---
    header = tk.Frame(section_frame, bg=COLOR_HEADER, height=35)
    header.grid(row=0, column=0, sticky="ew")
    header.grid_columnconfigure(2, weight=1)

    tk.Label(
        header,
        text=title_text,
        bg=COLOR_HEADER,
        fg=COLOR_TEXT,
        font=("Arial", 10, "bold"),
    ).grid(row=0, column=0, sticky="w", padx=10)

    # 검색창
    search_var = tk.StringVar()
    search_entry = tk.Entry(header, textvariable=search_var, width=30)
    search_entry.grid(row=0, column=1, padx=5)

    # 버튼 영역
    btn_frame = tk.Frame(header, bg=COLOR_HEADER)
    btn_frame.grid(row=0, column=2, sticky="e", padx=5)

    # 리스트 컨테이너
    list_container = tk.Frame(section_frame, bg=COLOR_LIST, bd=1, relief="solid")
    list_container.grid(row=1, column=0, sticky="nsew", pady=5)
    section_frame.grid_rowconfigure(1, weight=1)
    section_frame.grid_columnconfigure(0, weight=1)

    canvas = tk.Canvas(list_container, bg=COLOR_LIST, highlightthickness=0)
    scrollbar = tk.Scrollbar(
        list_container, orient="vertical", command=canvas.yview, width=25
    )
    scroll_frame = tk.Frame(canvas, bg=COLOR_LIST)

    inner_frame_id = canvas.create_window((0, 0), window=scroll_frame, anchor="nw")
    canvas.configure(yscrollcommand=scrollbar.set)

    def update_scroll_region(event):
        bbox = list(canvas.bbox("all"))
        if bbox:
            bbox[1] = 0
            canvas.configure(scrollregion=tuple(bbox))

    scroll_frame.bind("<Configure>", update_scroll_region)

    def resize_inner_frame(event):
        canvas.itemconfig(inner_frame_id, width=event.width)

    canvas.bind("<Configure>", resize_inner_frame)

    canvas.pack(side="left", fill="both", expand=True)
    scrollbar.pack(side="right", fill="y")

    items, raw_lines = read_csv(file_path)

    # ---------- 리스트 렌더 ----------
    def refresh_list(filtered=None):
        for w in scroll_frame.winfo_children():
            w.destroy()

        show_items = filtered if filtered is not None else items
        for entry in show_items:
            row = tk.Frame(
                scroll_frame,
                bg="#FFFFFF",
                highlightbackground="#000000",
                highlightthickness=1,
            )
            row.pack(fill="x", padx=5, pady=2)

            category = entry.get("category") or "분류없음"
            country = entry.get("country") or "국가없음"
            label_text = f"{entry['title']}  ({category} / {country})"
            tk.Label(
                row, text=label_text, bg="#FFFFFF", fg=COLOR_TEXT, font=("Arial", 10)
            ).pack(side="left", padx=10, pady=3)

            def delete_confirm(item):
                confirm = tk.Toplevel(root)
                confirm.title("삭제 확인")
                confirm.configure(bg=COLOR_BG)
                tk.Label(
                    confirm,
                    text=f"‘{item['title']}’ 을 삭제하시겠습니까?",
                    bg=COLOR_BG,
                    fg=COLOR_TEXT,
                ).pack(pady=20)
                btns = tk.Frame(confirm, bg=COLOR_BG)
                btns.pack(pady=10)

                def do_delete():
                    items.remove(item)
                    save_csv(file_path, items, raw_lines)
                    refresh_list()
                    confirm.destroy()

                tk.Button(btns, text="확인", command=do_delete, **btn_style).pack(
                    side="left", padx=6
                )
                tk.Button(btns, text="취소", command=confirm.destroy, **btn_style).pack(
                    side="left", padx=6
                )
                center_on_screen(confirm)

            def open_edit_popup(item):
                win = tk.Toplevel(root)
                win.title("주소 수정")
                win.configure(bg=COLOR_BG)

                tk.Label(win, text="제목:", bg=COLOR_BG).pack(pady=(12, 3))
                title_entry = tk.Entry(win, width=45)
                title_entry.insert(0, item["title"])
                title_entry.pack()

                tk.Label(win, text="주소:", bg=COLOR_BG).pack(pady=(10, 3))
                url_entry = tk.Entry(win, width=45)
                url_entry.insert(0, item["url"])
                url_entry.pack()

                tk.Label(win, text="카테고리:", bg=COLOR_BG).pack(pady=(10, 3))
                category_entry = tk.Entry(win, width=45)
                category_entry.insert(0, item.get("category", ""))
                category_entry.pack()

                tk.Label(win, text="국가:", bg=COLOR_BG).pack(pady=(10, 3))
                country_entry = tk.Entry(win, width=45)
                country_entry.insert(0, item.get("country", ""))
                country_entry.pack()

                def confirm_action():
                    item["title"] = title_entry.get().strip()
                    item["url"] = url_entry.get().strip()
                    item["category"] = category_entry.get().strip()
                    item["country"] = country_entry.get().strip()
                    save_csv(file_path, items, raw_lines)
                    refresh_list()
                    win.destroy()

                tk.Button(win, text="확인", command=confirm_action, **btn_style).pack(
                    pady=12
                )
                center_on_screen(win)

            actions = tk.Frame(row, bg="#FFFFFF")
            actions.pack(side="right", padx=4, pady=3)

            edit_btn = tk.Button(
                actions,
                text="수정",
                bg="#FFFFFF",
                fg=COLOR_TEXT,
                relief="flat",
                font=("Arial", 10, "bold"),
            )
            edit_btn.grid(row=0, column=0, padx=(0, 6))
            edit_btn.config(command=lambda e=entry: open_edit_popup(e))

            delete_btn = tk.Button(
                actions,
                text="삭제",
                bg="#FFFFFF",
                fg=COLOR_TEXT,
                relief="flat",
                font=("Arial", 10, "bold"),
            )
            delete_btn.grid(row=0, column=1)
            delete_btn.config(command=lambda e=entry: delete_confirm(e))

    # ---------- 검색 기능 ----------
    def search_items():
        query = search_var.get().strip().lower()
        if not query:
            refresh_list()
            return
        filtered = [
            it
            for it in items
            if query in it["title"].lower()
            or query in it["url"].lower()
            or query in (it.get("category") or "").lower()
            or query in (it.get("country") or "").lower()
        ]
        refresh_list(filtered)

    tk.Button(header, text="검색", command=search_items, **btn_style).grid(
        row=0, column=3, padx=5
    )

    # ---------- 정렬 기능 ----------
    def sort_items():
        popup = tk.Toplevel(root)
        popup.title("정렬 기준 선택")
        popup.configure(bg=COLOR_BG)
        tk.Label(popup, text="정렬 기준을 선택하세요:", bg=COLOR_BG).pack(pady=10)

        sort_options = ["title", "category", "country", "last_checked", "status"]
        var = tk.StringVar(value="title")

        for opt in sort_options:
            tk.Radiobutton(popup, text=opt, variable=var, value=opt, bg=COLOR_BG).pack(
                anchor="w", padx=20
            )

        def confirm():
            key = var.get()
            items.sort(key=lambda x: x.get(key, ""))
            save_csv(file_path, items, raw_lines)
            refresh_list()
            popup.destroy()

        tk.Button(popup, text="확인", command=confirm, **btn_style).pack(pady=10)
        center_on_screen(popup)

    # ---------- 추가 기능 ----------
    def open_add_popup():
        win = tk.Toplevel(root)
        win.title("주소 추가")
        win.configure(bg=COLOR_BG)

        tk.Label(win, text="제목:", bg=COLOR_BG).pack(pady=(12, 3))
        title_entry = tk.Entry(win, width=45)
        title_entry.pack()

        tk.Label(win, text="주소:", bg=COLOR_BG).pack(pady=(10, 3))
        url_entry = tk.Entry(win, width=45)
        url_entry.pack()

        tk.Label(win, text="카테고리 (선택):", bg=COLOR_BG).pack(pady=(10, 3))
        category_entry = tk.Entry(win, width=45)
        category_entry.pack()

        tk.Label(win, text="국가 (선택):", bg=COLOR_BG).pack(pady=(10, 3))
        country_entry = tk.Entry(win, width=45)
        country_entry.pack()

        def confirm_action():
            new_item = {
                "title": title_entry.get().strip(),
                "url": url_entry.get().strip(),
                "category": category_entry.get().strip(),
                "country": country_entry.get().strip(),
                "last_checked": "-",
                "status": "-",
            }
            if new_item["title"] and new_item["url"]:
                items.append(new_item)
                save_csv(file_path, items, raw_lines)
                refresh_list()
                win.destroy()

        tk.Button(win, text="확인", command=confirm_action, **btn_style).pack(pady=12)
        center_on_screen(win)

    def open_folder():
        os.startfile(DATA_DIR)

    # ---------- 헤더 버튼 배치 ----------
    tk.Button(btn_frame, text="추가", command=open_add_popup, **btn_style).pack(
        side="left", padx=3
    )
    tk.Button(btn_frame, text="정렬", command=sort_items, **btn_style).pack(
        side="left", padx=3
    )
    tk.Button(btn_frame, text="폴더열기", command=open_folder, **btn_style).pack(
        side="left", padx=3
    )

    refresh_list()


# ---------- 실행 ----------
tk.Label(
    root,
    text="뉴스 수집 프로그램 (CSV + 국가 + 검색 + 정렬)",
    bg=COLOR_BG,
    fg=COLOR_TEXT,
    font=("Arial", 16, "bold"),
).grid(row=0, column=0, pady=(20, 10))

create_section(root, "rss주소 추가", RSS_FILE, row_index=1)
create_section(root, "중앙주소 추가", CENTRAL_FILE, row_index=2)

root.mainloop()
