📦 Service Provider Portal (Angular + Java Backend)

This repository contains the Service Provider Frontend of the ShaadiSharthi WebApp, built with Angular + Bootstrap.
It allows service providers (e.g., photographers, caterers, decorators) to register, manage their business, upload services with media, and handle bookings — all connected to a Java Servlet backend.

🚀 Key Features

🔐 Authentication & Onboarding

Login / Signup flow with JWT-based authentication.

Forgot Password:
Email-based reset link with one-time JWT token.
Token verification before new password creation.

Create Account:
Email-based flow → set password, name, email.

Role-based redirection:

Basic Registered → goes to Business Form.
Pending Approval → redirected to Waiting Page.
Approved → full access to Dashboard.

📝 Business Registration & Approval

Service Provider must submit:
Business name, GST, Aadhaar, PAN, location, phone(s).

Admin Approval System:
Admin reviews business details.
On accept, provider gets email: “Approved, you can log in.”
On reject, provider gets email with rejection reason.

📊 Dashboard

Personalized header with name + profile dropdown.
Sidebar navigation:
Services
Pending Bookings
Confirmed Bookings
Account
FAQs

Dashboard widgets:
Upcoming orders, total bookings, customer stats.
Graphs & charts for booking analysis:
Pending / Accepted / Rejected / Completed.
Service performance & ratings.
Financial overview.

🛠 Service Management
Add/Edit/Delete Service:
Name, category (e.g., Photography, Catering), description, price.
Upload media files (images/videos).
Cloudinary Integration:
Request signature → direct upload to Cloudinary.
Metadata stored in backend.
Delete button removes media reference (Cloudinary cleanup planned in future).

Caching:
First fetch → stored in cache.
Re-visits → served from cache.
Cache refreshes on updates/deletes.

📅 Booking Management

Pending Bookings:
List of customer bookings awaiting provider response.
Accept or reject (optional reason).
Confirmed Bookings:
Accepted bookings with customer + service details.
Mark as Complete (only after event date) or Cancel.

Performance Scaling:
Hybrid Infinite Scroll + Pagination:
Fetches 20 bookings at a time.

Automatic scroll loading for seamless UX.

Virtual Scrolling (Angular CDK):
Only ~40 items rendered in DOM at once → smooth performance even with hundreds of bookings.

👤 Account & Support

Profile Management:
Overview: name, business details, address, contact info.
Edit Profile: update personal & business details.
Documents:
Upload/view GST, Aadhaar, PAN (basic placeholder support).
Change Password:
Current + new password validation.

FAQs:
Admin-managed static Q&A list.
Expand/collapse answers.
Contact Support:
Submit queries with subject + description.

Queries sent directly to admin.

🛡️ Security

Current State:
JWT stored in Session/Local Storage (vulnerable to XSS/CSRF).
Role-based guards for Basic, Pending Approval, and Approved users.
Auth headers added to backend calls.

Planned Improvements:
Move JWT handling to HTTP-only secure cookies.
Implement stricter token expiry & refresh flow.
Enhanced input sanitization for file uploads.

⚡ Performance Optimizations

Caching of service data to avoid redundant backend calls.
Lazy Loading of services (backend call only when entering the Services page).
Infinite Scroll + Pagination Hybrid for bookings.
Virtual Scrolling (Angular CDK) ensures DOM never overloads.

🛠️ Tech Stack

Frontend: Angular, Bootstrap
Backend: Java Servlets (Eclipse), MySQL
Media Storage: Cloudinary
Authentication: JWT (JSON Web Tokens)
Charts: Angular chart libraries (for booking/financial analytics)

📈 Future Roadmap

🔒 Security Hardening

Replace local/session storage with HTTP-only cookies.
Role-based access with stricter token refresh flow.

☁️ Cloudinary Cleanup Automation
Lambda or scheduled service to remove unused media.

🌍 Multi-language Support
Expand UI beyond English.

📸 Robust Media Uploading
File size limits, better error handling, MIME validation.

🔔 Real-time Notifications
WebSockets/SignalR for instant booking updates.

📊 Advanced Analytics
Trends, financial forecasting, customer retention insights.