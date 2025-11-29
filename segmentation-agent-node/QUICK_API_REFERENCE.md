# 🎯 Quick API Reference Card

## For Agent 2 (Message Generation)

### Get Segments
```http
GET http://localhost:8001/api/segments
```
Returns: List of all segments with customer counts

### Get Customers by Segment
```http
GET http://localhost:8001/api/segments/{id}?limit=100
```
Returns: Segment details + array of customers

### Get Customers (Paginated)
```http
GET http://localhost:8001/api/customers?segment_id={id}&limit=100&offset=0
```
Returns: Customers list with pagination

---

## For Dashboard/Orchestrator

### Health Check (Simple)
```http
GET http://localhost:8001/health
```
Returns: `{ status: "healthy" }`

### Status (Detailed)
```http
GET http://localhost:8001/status
```
Returns: Service status + database info + customer/segment counts

### Metrics (Analytics)
```http
GET http://localhost:8001/metrics
```
Returns: 
- Total customers
- Avg engagement score
- Total revenue
- Segment distribution

---

## Quick Test (PowerShell)

```powershell
# Health
Invoke-RestMethod http://localhost:8001/health

# Status
Invoke-RestMethod http://localhost:8001/status

# Metrics
Invoke-RestMethod http://localhost:8001/metrics

# Segments
Invoke-RestMethod http://localhost:8001/api/segments

# Customers in segment 1
Invoke-RestMethod "http://localhost:8001/api/segments/1?limit=50"
```

---

## All Available Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | API documentation |
| `/health` | GET | Quick health check |
| `/status` | GET | Detailed status |
| `/metrics` | GET | System metrics |
| `/api/segments` | GET | List segments |
| `/api/segments/:id` | GET | Get segment + customers |
| `/api/customers` | GET | List customers |
| `/api/customers/:id` | GET | Get customer |
| `/api/segment/refresh` | POST | Refresh segmentation |
| `/api/segment/calculate-engagement` | POST | Update scores |
