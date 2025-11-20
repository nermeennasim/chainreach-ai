# Compliance Rules Documentation

## Service: Content Safety (Person 4)

### Overview

This service ensures all messages processed in the system adhere to compliance standards before being sent to downstream systems (Person 3, campaign runners, or external communications). Compliance is enforced using **Azure Content Safety API**.

---

### Endpoints

| Endpoint                      | Method | Description                                                     |
| ----------------------------- | ------ | --------------------------------------------------------------- |
| `/api/content-safety/health`  | GET    | Returns the health status of the Content Safety service.        |
| `/api/content-safety/analyze` | POST   | Analyzes one or multiple messages for compliance.               |
| `/api/validate`               | POST   | Validates messages from Person 3 according to compliance rules. |
| `/api/Health`                 | GET    | General service health for the compliance module.               |
| `/api/Stats`                  | GET    | Returns usage statistics for the compliance service.            |

---

### Compliance Rules

1. **Message Review**

   * Each message is analyzed for prohibited categories:

     * Hate speech
     * Sexual content
     * Violence
     * Self-harm
   * Messages exceeding the allowed threshold in any category are marked as **disapproved**.

2. **Approval Logic**

   * `approved = True` only if all categories are below the threshold.
   * `approved = False` if any categories are above the threshold.

3. **Processing Flow**

   1. Messages are submitted via `/api/content-safety/analyze`.
   2. Service returns an approval status with category details.
   3. Downstream systems only act on messages marked as `approved = True`.

4. **Logging & Monitoring**

   * All requests are counted and monitored.
   * Health endpoint provides real-time status of the service.
   * Stats endpoint tracks total requests and uptime.