# 📘 FinBot v3.0 - Complete API Reference

**Version**: 3.0  
**Last Updated**: 2025-10-12  
**Production URL**: https://finbot-v3.onrender.com/api  
**Development URL**: http://localhost:5000/api

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Core APIs](#core-apis)
   - [Dashboard](#dashboard)
   - [Consolidation](#consolidation)
   - [Risk Analysis](#risk-analysis)
   - [Simulation](#simulation)
   - [Portfolio Advisor](#portfolio-advisor)
4. [Advanced Features](#advanced-features)
   - [Realtime Events (SSE)](#realtime-events)
   - [Advanced Analytics](#advanced-analytics)
   - [Performance Monitoring](#performance-monitoring)
   - [Enhanced Export](#enhanced-export)
5. [Response Formats](#response-formats)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Permissions](#permissions)

---

## 🎯 Overview

FinBot API provides comprehensive financial management capabilities including:
- **Dashboard Widgets**: Customizable financial dashboards
- **Realtime Updates**: Server-Sent Events (SSE) for live data
- **Advanced Analytics**: Trends, projections, and forecasting
- **Performance Monitoring**: Query optimization and caching
- **Multi-format Export**: JSON, CSV, PDF with custom styling

---

## 🔐 Authentication

All API endpoints require JWT authentication via Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@finbot.com",
  "password": "admin123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "admin@finbot.com",
    "role": "admin",
    "username": "admin"
  }
}
```

### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

---

## 📊 Core APIs

### Dashboard

#### Get Dashboard Data

```http
GET /api/dashboard
Authorization: Bearer <token>
```

**Response:**

```json
{
  "accounts": [...],
  "recentTransactions": [...],
  "totalBalance": 1000000,
  "companyBalance": 750000,
  "personalBalance": 250000,
  "totalCash": 800000,
  "totalDebt": 200000,
  "totalTransactions": 150
}
```

#### Get Dashboard Layout

```http
GET /api/dashboard/layout
```

**Response:**

```json
{
  "success": true,
  "data": {
    "widgets": [
      {
        "id": "financial-health",
        "type": "financial-health",
        "title": "Finansal Sağlık",
        "enabled": true,
        "position": { "row": 1, "col": 1 },
        "size": { "width": 2, "height": 2 }
      }
    ]
  }
}
```

#### Save Dashboard Layout

```http
POST /api/dashboard/layout
Content-Type: application/json

{
  "widgets": [...]
}
```

**Required Permission:** `MANAGE_DASHBOARD`

### Consolidation

#### Get Consolidation Breakdown

```http
GET /api/consolidation/breakdown
Authorization: Bearer <token>
```

**Response:**

```json
{
  "breakdown": {
    "company": {
      "bank": 600000,
      "cash": 50000,
      "credit": 25000,
      "investment": 150000
    },
    "personal": {
      "bank": 200000,
      "cash": 15000,
      "credit": 10000,
      "investment": 50000
    }
  },
  "summary": {
    "totalCompany": 825000,
    "totalPersonal": 275000,
    "totalAmount": 1100000
  }
}
```

### Risk Analysis

#### Get Risk Analysis

```http
GET /api/risk/analysis?fxDelta=5&rateDelta=-2&inflationDelta=8&liquidityGap=5
Authorization: Bearer <token>
```

**Query Parameters:**
- `fxDelta`: Döviz kuru değişimi % (range: -100 to +100)
- `rateDelta`: Faiz oranı değişimi % (range: -50 to +50)
- `inflationDelta`: Enflasyon değişimi %
- `liquidityGap`: Likidite açığı %

**Response:**

```json
{
  "best": { "cash": 120000, "score": 85 },
  "base": { "cash": 100000, "score": 70 },
  "worst": { "cash": 75000, "score": 45 },
  "riskLevel": "medium",
  "recommendations": [
    "Portföyü çeşitlendirin",
    "Risk yönetimi stratejisi geliştirin"
  ]
}
```

#### Compare Risk Scenarios

```http
POST /api/risk/scenarios/compare
Content-Type: application/json

{
  "scenarios": [
    {
      "name": "Optimistic",
      "fxDelta": 5,
      "rateDelta": -2
    },
    {
      "name": "Pessimistic",
      "fxDelta": -10,
      "rateDelta": 5
    }
  ]
}
```

### Simulation

#### Run Simulation

```http
POST /api/simulation/run
Content-Type: application/json

{
  "fxDelta": 10,
  "rateDelta": -5,
  "inflationDelta": 5,
  "horizonMonths": 6
}
```

**Response:**

```json
{
  "id": "simulation-id",
  "parameters": {...},
  "currentState": {
    "cash": 100000,
    "debt": 50000,
    "netWorth": 50000
  },
  "projections": [
    {
      "month": 1,
      "cash": 95000,
      "debt": 51000
    }
  ],
  "summary": {
    "formattedSummary": "Bu senaryoda 4 ay içinde nakit açığı oluşabilir.",
    "cashDeficitMonth": 4
  }
}
```

#### Get Simulation History

```http
GET /api/simulation/history?limit=10&offset=0
```

### Portfolio Advisor

#### Get Portfolio Recommendations

```http
POST /api/advisor/portfolio
Content-Type: application/json

{
  "portfolio": {
    "cash": 100000,
    "deposits": 200000,
    "forex": 50000,
    "stocks": 150000
  },
  "riskProfile": "medium"
}
```

**Response:**

```json
{
  "riskScore": 75,
  "riskLevel": "medium",
  "tips": [
    {
      "category": "allocation",
      "title": "Döviz Pozisyonu Artırın",
      "priority": "medium"
    }
  ],
  "recommendations": {
    "rebalance": true,
    "expectedReturn": 8.5
  }
}
```

---

## 🚀 Advanced Features

### Realtime Events

#### Subscribe to Realtime Events (SSE)

```http
GET /api/realtime/subscribe?topics=user.dashboard,user.finance
Accept: text/event-stream
```

**Event Format:**

```json
{
  "id": "evt_123",
  "type": "dashboard.widget.updated",
  "userId": "user123",
  "topic": "user.dashboard",
  "data": {...},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Event Types:**
- `dashboard.widget.updated`, `dashboard.layout.changed`
- `finance.aging.updated`, `finance.runway.updated`
- `account.created`, `account.updated`
- `transaction.created`, `transaction.updated`

### Advanced Analytics

#### Get AR/AP Trends

```http
GET /api/analytics/trends/ar?period=monthly&months=12
GET /api/analytics/trends/ap?period=monthly&months=12
```

**Response:**

```json
{
  "data": [
    {
      "period": "2024-01",
      "value": 150000,
      "change": 5000,
      "changePercent": 3.45
    }
  ],
  "summary": {
    "totalValue": 1800000,
    "trend": "increasing",
    "volatility": 12500
  },
  "forecast": {
    "nextPeriod": 155000,
    "confidence": 0.75
  }
}
```

#### Get Cash Flow Projection

```http
GET /api/analytics/cashflow-projection?months=12
```

### Performance Monitoring

#### Get Query Performance Metrics

```http
GET /api/performance/metrics
```

**Required Permission:** `VIEW_SETTINGS`

#### Get Cache Statistics

```http
GET /api/performance/cache/stats
```

**Response:**

```json
{
  "size": 150,
  "hitRate": 85.5,
  "totalRequests": 2500,
  "cacheHits": 2138
}
```

#### Clear Cache

```http
POST /api/performance/cache/clear
```

**Required Permission:** `MANAGE_SETTINGS`

### Enhanced Export

#### Generate Cash Flow Bridge Report

```http
POST /api/export/cash-flow-bridge
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "period": "monthly",
  "currency": "TRY",
  "format": "pdf"
}
```

**Supported Formats:** `json`, `csv`, `pdf`

**Required Permission:** `EXPORT_DATA`

#### Export Summary CSV

```http
GET /api/export/summary.csv?locale=tr-TR
```

#### Export Transactions CSV

```http
GET /api/export/transactions.csv?startDate=2024-01-01&endDate=2024-01-31
```

---

## 📦 Response Formats

### Success Response

```json
{
  "success": true,
  "data": {...},
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "details": {...},
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/endpoint"
}
```

### Pagination

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## ❌ Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing/invalid JWT |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

### Error Codes

#### 400 Bad Request

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": {
    "fxDelta": "Döviz kuru değişimi -100 ile +100 arasında olmalıdır"
  }
}
```

#### 401 Unauthorized

```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required",
  "details": { "code": "TOKEN_MISSING" }
}
```

#### 403 Forbidden

```json
{
  "error": "FORBIDDEN",
  "message": "Insufficient permissions",
  "details": {
    "required": "VIEW_ALL_REPORTS",
    "current": "VIEW_PERSONAL_REPORTS"
  }
}
```

---

## 🚦 Rate Limiting

- **Default**: 100 requests per minute per IP
- **Admin**: 1000 requests per minute
- **Authentication**: 10 requests per minute per IP
- **Simulation**: 5 requests per minute per user
- **Export**: 20 requests per hour per user
- **Realtime**: 10 connections per user

---

## 🔑 Permissions

### Dashboard Permissions
- `VIEW_DASHBOARD`: View dashboard
- `MANAGE_DASHBOARD`: Manage dashboard layout

### Analytics Permissions
- `VIEW_ANALYTICS`: View analytics and trends
- `EXPORT_DATA`: Export data and reports

### System Permissions
- `VIEW_SETTINGS`: View system settings
- `MANAGE_SETTINGS`: Manage system settings
- `ADMIN`: Full administrative access

---

## 🔌 WebSocket Events

### Connection

```javascript
const ws = new WebSocket('ws://localhost:5000/ws');

ws.onmessage = event => {
  const data = JSON.parse(event.data);
  // Handle event types
};
```

### Event Types

- `ACCOUNT_UPDATE`: Hesap bakiye güncellemesi
- `TRANSACTION_ADDED`: Yeni işlem eklendi
- `TRANSACTION_UPDATED`: İşlem güncellendi
- `RISK_ALERT`: Risk uyarısı
- `SIMULATION_COMPLETE`: Simülasyon tamamlandı

---

## 📝 Filtering & Sorting

### Query Parameters

- `sort`: Sıralama alanı (`createdAt`, `amount`, `date`)
- `order`: Sıralama yönü (`asc`, `desc`)
- `filter`: Filtreleme kriterleri (JSON string)

### Example

```http
GET /api/transactions?sort=date&order=desc&filter={"category":"income"}
```

---

## 📖 API Changelog

### v3.0.0 (Current)
- ✅ Dashboard widget management
- ✅ Realtime events with SSE
- ✅ Advanced analytics with trends
- ✅ Enhanced export with PDF
- ✅ Performance monitoring
- ✅ Virtual scrolling for large datasets

### v2.0.0
- Aging analysis
- Runway and cash gap analysis
- Basic export functionality

### v1.0.0
- Initial release with basic financial management

---

## 🔗 SDKs

Official SDKs available for:
- **JavaScript/TypeScript**
- **Python**
- **PHP**

---

**For detailed implementation examples and advanced use cases, see the `/examples` directory.**

**Support**: support@finbot.com  
**Documentation**: https://docs.finbot.com  
**Status Page**: https://status.finbot.com

