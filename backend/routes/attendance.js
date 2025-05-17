const express = require("express");
const Attendance = require("../models/Attendance");
const router = express.Router();
const User = require("../models/User");

router.post("/", async (req, res) => {
  const { userId, status } = req.body;
  const attendance = new Attendance({ userId, status });
  await attendance.save();

  res.json({ message: "Attendance marked" });
});

router.get("/:userId", async (req, res) => {
  const attendance = await Attendance.find({ userId: req.params.userId });
  res.json(attendance);
});

router.get("/summary/:userId", async (req, res) => {
  const { userId } = req.params;
  const { year, month } = req.query;

  try {
    if (!year || !month) {
      return res.status(400).json({ message: "Year and Month are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const startDate = new Date(`${year}-${month}-01`)
      .toISOString()
      .slice(0, 10);
    const endDate = new Date(`${year}-${month}-31`).toISOString().slice(0, 10);

    const attendanceRecords = await Attendance.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    const presentDays = attendanceRecords.filter(
      (record) => record.status.trim().toLowerCase() === "present"
    ).length;
    const absentDays = attendanceRecords.filter(
      (record) => record.status.trim().toLowerCase() === "absent"
    ).length;
    const leaveDays = attendanceRecords.filter(
      (record) => record.status.trim().toLowerCase() === "leave"
    ).length;

    res.json({
      userName: user.name,
      userEmail: user.email,
      year,
      month,
      presentDays,
      absentDays,
      leaveDays,
    });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});
//   try {
//     const { userId } = req.params;
//     const { year, month } = req.query;

//     console.log(
//       `Fetching attendance for UserID: ${userId}, Year: ${year}, Month: ${month}`
//     );

//     if (!userId || !year || !month) {
//       return res
//         .status(400)
//         .json({ error: "Missing required query parameters" });
//     }

//     const startDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
//     const endDate = new Date(
//       `${year}-${(parseInt(month) + 1)
//         .toString()
//         .padStart(2, "0")}-01T00:00:00.000Z`
//     );

//     console.log("Querying MongoDB from:", startDate, "to:", endDate);

//     const records = await Attendance.find({
//       userId,
//       date: { $gte: startDate, $lt: endDate },
//     }).sort({ date: 1 });

//     console.log("Fetched Records:", records);

//     res.json(records);
//   } catch (error) {
//     console.error("Server Error Fetching Attendance:", error);
//     res.status(500).json({ error: "Failed to fetch attendance records" });
//   }
// });



// Example geo-fence coordinates (circle with center and radius)
const geoFenceCenter = { lat: 28.6139, lng: 77.209 }; // e.g., Delhi
const geoFenceRadiusMeters = 100000; // 1 km radius

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

router.post("/mark", async (req, res) => {
  const { userId, date, status, lat, lng, wfh, holiday: clientHoliday } = req.body;

  // Geo-fencing check
  let geoFenceStatus = "Outside";
  if (lat && lng) {
    const distance = getDistanceFromLatLonInMeters(
      lat,
      lng,
      geoFenceCenter.lat,
      geoFenceCenter.lng
    );
    if (distance <= geoFenceRadiusMeters) {
      geoFenceStatus = "Inside";
    }
  } else {
    geoFenceStatus = "Unknown"; // No location provided
  }

  // Determine if it's a holiday
  const dayOfWeek = new Date(date).getDay();
  const isSunday = dayOfWeek === 0;
  const holiday = clientHoliday === true || isSunday;

  // Create attendance record
  const attendance = new Attendance({
    userId,
    date,
    status,
    geoFenceStatus,
    holiday,
    wfh: wfh || false,
  });

  try {
    await attendance.save();
    res.json({ message: "Attendance marked", attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/details/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { year, month } = req.query;

    if (!userId || !year || !month) {
      return res
        .status(400)
        .json({ error: "Missing required query parameters" });
    }

    const y = parseInt(year, 10);
    const m = parseInt(month, 10);

    if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
      return res.status(400).json({ error: "Invalid year or month format" });
    }

    const startDate = `${y}-${String(m).padStart(2, "0")}-01`;
    const endDate = `${y}-${String(m + 1).padStart(2, "0")}-01`;

    console.log(`Querying MongoDB from: ${startDate} to ${endDate}`);

    const records = await Attendance.find({
      userId,
      date: { $gte: startDate, $lt: endDate },
    }).sort({ date: 1 });

    console.log("Fetched Records:", records);

    res.json(records);
  } catch (error) {
    console.error("Server Error Fetching Attendance:", error);
    res.status(500).json({ error: "Failed to fetch attendance records" });
  }
});

module.exports = router;
