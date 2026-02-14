# PLASTIC WASTE EXCHANGE SYSTEM

A platform to connect users with nearby waste collectors, earn reward points for sending waste, and promote recycling.

# Tech Stack

Frontend: HTML, CSS, JavaScript

Backend: Node.js, Express.js

Database: MySQL

Plastic-Waste-Exchange-System/
├─ backend/
│ ├─ app.js # Main server file
│ ├─ Controllers/ # Controller files
│ │ ├─ authController.js
│ │ ├─ userController.js
│ │ ├─ collectorController.js
│ │ └─ adminController.js
│ ├─ Models/ # Model files (DB queries)
│ │ ├─ User.js
│ │ ├─ Collector.js
│ │ ├─ Admin.js
│ │ └─ Collection.js
│ ├─ Routes/ # API routes
│ │ ├─ authRouter.js
│ │ ├─ userRouter.js
│ │ ├─ collectorRouter.js
│ │ └─ adminRouter.js
│ ├─ Utils/
│ │ └─ database.js # MySQL connection
│ └─ package.json
├─ frontend/
| |-CSS
| |-JS
│ ├─ public/
│ │ └─ images/
│ └─ home.html
│ ├─ home.html
│ ├─ request.html
│ ├─ rewards.html
│ ├─ collectorDashboard.html
│ ├─ pendingTasks.html
│ ├─ completedTasks.html
│ ├─ adminDashboard.html
│ ├─ allUsers.html
│ ├─ allCollectors.html
│ ├─ manageRewards.html
│ ├─ login.html
│ ├─ signup.html
│ ├─ editProfile.html
│ ├─ about.html
│ ├─ contact.html
│ ├─ learnMore.html
│ ├─ 404.html
└─ README.md
