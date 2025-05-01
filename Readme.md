
# Multi-Service Project Setup

This repository consists of multiple services that must be run in parallel using separate terminals. Follow the instructions for each service below.

---

## 📦 Voice Chat Backend

**Directory:** `voice_chat_backend/`

**Setup & Run:**
```bash
cd voice_chat_backend
pip install -r requirements.txt
python app.py
```

---

## 🧠 Risk Prediction Service

**Directory:** `risk_production/`

**Setup & Run:**
```bash
cd risk_production
pip install -r requirements.txt
python predict_maternal_risk.py
python predict_neonatal_risk.py
```



---

## 👶 Neonatal Cry Analyzer

**Directory:** `neonatal/`

**Setup & Run:**
```bash
cd neonatal
pip install -r requirements.txt
python cry_analyzer_service.py
```

---

## 🌐 Frontend or Dev Server

**Setup & Run:**
```bash
npm install
npm run dev
```

> Make sure you run this command from the root directory or where your `package.json` is located.



## ✅ Recommendations

- Use different terminal tabs/windows for each service.
- Check `.env` or configuration files if ports conflict.
