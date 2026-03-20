import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:tamdansers_app/constants/app_colors.dart';
import 'package:tamdansers_app/constants/app_number.dart';
import 'package:tamdansers_app/constants/text_style.dart';

class AttandanceScreen extends StatefulWidget {
  const AttandanceScreen({super.key});

  @override
  State<AttandanceScreen> createState() => _AttandanceScreenState();
}

class _AttandanceScreenState extends State<AttandanceScreen> {
  int _currentMonthIndex = 0;

  final List<String> _months = [
    "តុលា ២០២៣",
    "វិច្ឆិកា ២០២៣",
    "ធ្នូ ២០២៣",
  ];

  // Summary data
  final int presentDays = 20;
  final int lateDays = 1;
  final int absentDays = 0;

  // Attendance records
  final List<Map<String, dynamic>> _records = [
    {
      "day": "ថ្ងៃចន្ទ, ១៦តុលា",
      "time": "Check-in: 07 : 30 AM",
      "status": "វត្តមាន",
      "type": "present",
    },
    {
      "day": "ថ្ងៃសុក្រ, ១៣តុលា",
      "time": "Check-in: 07 : 35 AM",
      "status": "វត្តមាន",
      "type": "present",
    },
    {
      "day": "ថ្ងៃព្រហស្បត្តិ៍, ១២តុលា",
      "time": "Check-in: 08 : 15 AM",
      "status": "យឺត",
      "type": "late",
    },
    {
      "day": "ថ្ងៃពុធ, ១១តុលា",
      "time": "Check-in: 07 : 28 AM",
      "status": "វត្តមាន",
      "type": "present",
    },
    {
      "day": "ថ្ងៃអង្គារ, ១០តុលា",
      "time": "Sick Leave",
      "status": "អវត្តមាន",
      "type": "absent",
    },
  ];

  void _previousMonth() {
    if (_currentMonthIndex > 0) {
      setState(() => _currentMonthIndex--);
    }
  }

  void _nextMonth() {
    if (_currentMonthIndex < _months.length - 1) {
      setState(() => _currentMonthIndex++);
    }
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        backgroundColor: AppColors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.primaryText),
          onPressed: () => Navigator.pop(context),
        ),
        centerTitle: true,
        title: Text("វត្តមាន", style: AppTextStyle.subtitle18),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.symmetric(
                    horizontal: AppNumber.screenPadding),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 16),
                    _buildProfileCard(),
                    const SizedBox(height: 20),
                    _buildMonthSelector(),
                    const SizedBox(height: 16),
                    _buildStatsRow(),
                    const SizedBox(height: 20),
                    Text("កំណត់សហេតុប្រចាំថ្ងៃ",
                        style: AppTextStyle.subtitle16),
                    const SizedBox(height: 12),
                    _buildAttendanceList(),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ),
          _buildRequestLeaveButton(),
        ],
      ),
    );
  }

  // ==================== PROFILE CARD ====================
  Widget _buildProfileCard() {
    return Row(
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.primaryBg,
            border: Border.all(color: AppColors.lightgrey, width: 2),
          ),
          child: ClipOval(
            child: Image.asset(
              'assets/images/user_profile.png',
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Icon(
                Icons.person,
                color: AppColors.primaryMain,
                size: 30,
              ),
            ),
          ),
        ),
        const SizedBox(width: 14),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Sophea Chan", style: AppTextStyle.subtitle18),
            const SizedBox(height: 2),
            Text(
              "ថ្នាក់ទី 5A  -  ID:123456",
              style: AppTextStyle.caption14Secondary,
            ),
          ],
        ),
      ],
    );
  }

  // ==================== MONTH SELECTOR ====================
  Widget _buildMonthSelector() {
    return Column(
      children: [
        Text(
          "បង្ហាញកិច្ចផ្សរសម្រាប់",
          style: AppTextStyle.caption14Secondary,
        ),
        const SizedBox(height: 6),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            GestureDetector(
              onTap: _previousMonth,
              child: const Icon(Icons.chevron_left,
                  size: 28, color: AppColors.primaryText),
            ),
            const SizedBox(width: 8),
            Text(
              _months[_currentMonthIndex],
              style: AppTextStyle.subtitle18,
            ),
            const SizedBox(width: 6),
            Icon(Icons.calendar_today,
                size: 18, color: AppColors.secondaryText),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: _nextMonth,
              child: const Icon(Icons.chevron_right,
                  size: 28, color: AppColors.primaryText),
            ),
          ],
        ),
      ],
    );
  }

  // ==================== STATS ROW ====================
  Widget _buildStatsRow() {
    return Row(
      children: [
        _buildStatCard(
          icon: Icons.check_circle_outline,
          iconColor: AppColors.primaryMain,
          label: "វត្តមាន",
          value: presentDays.toString(),
          unit: "ថ្ងៃ",
          bgColor: AppColors.primaryBg,
          valueBgColor: const Color(0xFFD6E9FF),
          valueColor: AppColors.primaryMain,
        ),
        const SizedBox(width: 10),
        _buildStatCard(
          icon: Icons.access_time,
          iconColor: AppColors.orange,
          label: "យឺត",
          value: lateDays.toString(),
          unit: "ថ្ងៃ",
          bgColor: const Color(0xFFFFF3E0),
          valueBgColor: const Color(0xFFFFE0B2),
          valueColor: AppColors.orange,
        ),
        const SizedBox(width: 10),
        _buildStatCard(
          icon: Icons.cancel_outlined,
          iconColor: AppColors.error,
          label: "អវត្តមាន",
          value: absentDays.toString(),
          unit: "ថ្ងៃ",
          bgColor: AppColors.errorBG,
          valueBgColor: const Color(0xFFFFCDD2),
          valueColor: AppColors.error,
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
    required String unit,
    required Color bgColor,
    required Color valueBgColor,
    required Color valueColor,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(AppNumber.radiusMedium),
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, size: 16, color: iconColor),
                const SizedBox(width: 4),
                Flexible(
                  child: Text(
                    label,
                    style: GoogleFonts.kantumruyPro(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: iconColor,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: GoogleFonts.kantumruyPro(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: valueColor,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              unit,
              style: GoogleFonts.kantumruyPro(
                fontSize: 13,
                color: valueColor,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ==================== ATTENDANCE LIST ====================
  Widget _buildAttendanceList() {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _records.length,
      separatorBuilder: (_, __) => Divider(
        color: AppColors.lightgrey,
        height: 1,
      ),
      itemBuilder: (context, index) {
        final record = _records[index];
        return _buildAttendanceItem(record);
      },
    );
  }

  Widget _buildAttendanceItem(Map<String, dynamic> record) {
    final type = record["type"] as String;

    Color statusColor;
    Color statusBgColor;
    Color dotColor;

    switch (type) {
      case "present":
        statusColor = AppColors.primaryMain;
        statusBgColor = AppColors.primaryBg;
        dotColor = AppColors.primaryMain;
        break;
      case "late":
        statusColor = AppColors.orange;
        statusBgColor = const Color(0xFFFFF3E0);
        dotColor = AppColors.orange;
        break;
      case "absent":
        statusColor = AppColors.error;
        statusBgColor = AppColors.errorBG;
        dotColor = AppColors.error;
        break;
      default:
        statusColor = AppColors.secondaryText;
        statusBgColor = AppColors.backgroundLight;
        dotColor = AppColors.secondaryText;
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Dot indicator
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: dotColor,
            ),
          ),
          const SizedBox(width: 12),
          // Day + Check-in time
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  record["day"],
                  style: AppTextStyle.subtitle16,
                ),
                const SizedBox(height: 2),
                Text(
                  record["time"],
                  style: AppTextStyle.caption13Secondary,
                ),
              ],
            ),
          ),
          // Status tag
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: statusBgColor,
              borderRadius: BorderRadius.circular(AppNumber.radiusRounded),
            ),
            child: Text(
              record["status"],
              style: GoogleFonts.kantumruyPro(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: statusColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ==================== REQUEST LEAVE BUTTON ====================
  Widget _buildRequestLeaveButton() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      decoration: const BoxDecoration(
        color: AppColors.white,
      ),
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          onPressed: () {},
          icon: const Icon(Icons.edit_calendar_outlined, size: 20),
          label: Text(
            "Request Leave",
            style: GoogleFonts.kantumruyPro(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primaryMain,
            foregroundColor: AppColors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppNumber.radiusPill),
            ),
            elevation: 0,
          ),
        ),
      ),
    );
  }
}
