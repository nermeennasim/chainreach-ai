# Person 4 – Compliance Checker (Azure Functions)

This is the Azure Functions version of the Person 4 compliance checking service.  
Designed to integrate with **Azure Content Safety** for message moderation.

---

## Endpoints

| Method | Route       | Description                |
|--------|-------------|----------------------------|
| GET    | `/health`   | Health check               |
| POST   | `/validate` | Validate messages          |
| GET    | `/stats`    | Basic runtime statistics   |

---

## Run Locally

### 1. Install dependencies
```bash
pip install -r requirements.txt
