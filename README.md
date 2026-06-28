# SIDForm 🟡

Drag & drop form builder — bikin online form dalam hitungan menit. No code, no stress.

🚀 **Live Demo:** [https://frontend-ari-rahmat-r-s-projects.vercel.app](https://frontend-ari-rahmat-r-s-projects.vercel.app) | **Stack:** Next.js 16, FastAPI, Tailwind v4, @dnd-kit, Form.io

## Yang udah jalan

- **Drag & drop builder** — 14+ field types (text, email, number, radio, checkbox, dropdown, date, file upload, signature, heading, divider, dll)
- **Real-time preview** — setiap field langsung kelihatan previewnya di canvas
- **API Backend Integration** — form lo otomatis kesimpen ke Backend FastAPI pake struktur JSON Schema Form.io
- **Export JSON** — form lo otomatis jadi JSON Schema, bisa diintegrasi kemana aja
- **Responsive** — mobile-first, dibangun pake design system "Minimalist Modern"

## Tech di balik layar

| Layer | Tools |
|-------|-------|
| Framework | Next.js 16 + React 19 |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Styling | Tailwind CSS v4 + cva |
| Animasi | Framer Motion |
| Backend | FastAPI + Uvicorn + Pydantic |

## Run locally

```bash
# Terminal 1 - Backend
cd backend && source venv/bin/activate && uvicorn main:app --port 8001 --reload

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

Buka [http://localhost:3001](http://localhost:3001).

## Based on

Dibangun berdasarkan research dari:
- BESSER low-code platform (Alfonso et al., 2024)
- Low-code developer discussion analysis (Al Alamin et al., 2022)
- OutSystems polyglot data layer (Nunes Alonso et al., 2020)
- ER-based declarative web programming (Hanus & Koschnicke, 2011)

---

Built by [Ari Rahmat](https://github.com/arighmt67-bit)
