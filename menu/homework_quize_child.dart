import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:tamdansers_app/constants/app_colors.dart';
import 'package:tamdansers_app/constants/app_number.dart';
import 'package:tamdansers_app/constants/text_style.dart';

class HomeworkQuizeScreen extends StatefulWidget {
  const HomeworkQuizeScreen({super.key});

  @override
  State<HomeworkQuizeScreen> createState() => _HomeworkQuizeScreenState();
}

class _HomeworkQuizeScreenState extends State<HomeworkQuizeScreen> {
  int _selectedTab = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),
                _buildProfileHeader(),
                const SizedBox(height: 16),
                _buildTabSelector(),
                const SizedBox(height: 16),
                _buildStatsRow(),
                const SizedBox(height: 20),
                if (_selectedTab == 0) ...[
                  _buildTodaySection(),
                  const SizedBox(height: 20),
                  _buildRecentSection(),
                  const SizedBox(height: 20),
                  _buildNewQuizzesSection(),
                ] else ...[
                  _buildNewQuizzesSection(),
                ],
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ==================== PROFILE HEADER ====================
  Widget _buildProfileHeader() {
    return Row(
      children: [
        Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.primaryBg,
            border: Border.all(color: AppColors.primaryMain, width: 2),
          ),
          child: ClipOval(
            child: Image.asset(
              'assets/images/user_profile.png',
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Icon(
                Icons.person,
                color: AppColors.primaryMain,
                size: 28,
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text("ហេង ឡូយ", style: AppTextStyle.subtitle18),
                  const SizedBox(width: 4),
                  Icon(Icons.keyboard_arrow_down,
                      size: 20, color: AppColors.secondaryText),
                ],
              ),
              const SizedBox(height: 2),
              Text(
                "ថ្នាក់ទី 5A ID: #29384",
                style: AppTextStyle.caption13Secondary,
              ),
            ],
          ),
        ),
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.backgroundLight,
            border: Border.all(color: AppColors.lightgrey),
          ),
          child: Icon(Icons.person_outline,
              size: 22, color: AppColors.secondaryText),
        ),
      ],
    );
  }

  // ==================== TAB SELECTOR ====================
  Widget _buildTabSelector() {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.grey.shade200,
        borderRadius: BorderRadius.circular(AppNumber.radiusMedium),
      ),
      child: Row(
        children: [
          _buildTab("កិច្ចការផ្ទះ", 0),
          _buildTab("កម្រងសំណួរ", 1),
        ],
      ),
    );
  }

  Widget _buildTab(String label, int index) {
    final isSelected = _selectedTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedTab = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primaryMain : Colors.transparent,
            borderRadius: BorderRadius.circular(AppNumber.radiusSmall),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: GoogleFonts.kantumruyPro(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: isSelected ? AppColors.white : AppColors.primaryText,
            ),
          ),
        ),
      ),
    );
  }

  // ==================== STATS ROW ====================
  Widget _buildStatsRow() {
    return Row(
      children: [
        // Left stats card
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(AppNumber.radiusLarge),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppColors.primaryBg,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Icon(Icons.flag_outlined,
                          size: 18, color: AppColors.primaryMain),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text("កិច្ចមន​ទា",
                          style: AppTextStyle.caption14Secondary),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: AppColors.lightPink,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        "m",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.pepure,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("កិច្ចការ", style: AppTextStyle.caption12Primary),
                        Text("និន្នមប្រកួ",
                            style: AppTextStyle.caption12Secondary),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        // Right stats card - percentage
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(AppNumber.radiusLarge),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "៨៥%",
                  style: GoogleFonts.kantumruyPro(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryText,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  "កួរមួយដែល មាន១រួ",
                  style: AppTextStyle.caption12Secondary,
                  maxLines: 2,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ==================== TODAY SECTION ====================
  Widget _buildTodaySection() {
    return Column(
      children: [
        // Section header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text("ថ្ងៃនេះ", style: AppTextStyle.subtitle18),
            Text("២៦ តុលា", style: AppTextStyle.caption14Secondary),
          ],
        ),
        const SizedBox(height: 12),

        // Card 1 - Math practice (green accent)
        _buildHomeworkCard(
          icon: Icons.check_circle_outline,
          iconColor: AppColors.success,
          iconBgColor: AppColors.successBG,
          title: "សំហាត់គណិតវិទ្យា",
          tag: "នorg",
          tagColor: AppColors.success,
          tagBgColor: AppColors.successBG,
          subtitle: "គណិតវិទ្យា • មេរៀនទី១៦",
          hasTimeInfo: true,
          timeText: "ល្បប់ទៅច 5:00 ល្ងាច",
          hasButton: true,
          buttonText: "ចាប់ផ្ដើមដោះស្រាយ",
          accentColor: AppColors.success,
        ),
        const SizedBox(height: 12),

        // Card 2 - Reading
        _buildHomeworkCard(
          icon: Icons.headphones,
          iconColor: AppColors.primaryMain,
          iconBgColor: AppColors.primaryBg,
          title: "ការអាន",
          tag: "នorg",
          tagColor: AppColors.success,
          tagBgColor: AppColors.successBG,
          subtitle: "ភាសាខ្មែរ",
        ),
      ],
    );
  }

  // ==================== RECENT SECTION ====================
  Widget _buildRecentSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("រៀបមិញ", style: AppTextStyle.subtitle18),
        const SizedBox(height: 12),

        // Card 3 - Ancient temples
        _buildHomeworkCard(
          icon: Icons.public,
          iconColor: AppColors.pepure,
          iconBgColor: AppColors.lightPink,
          title: "ប្រាសាទបូរាណ",
          tag: "របស់បូទ្រ",
          tagColor: AppColors.pepure,
          tagBgColor: AppColors.lightPink,
          subtitle: "ប្រវត្តិវិទ្យា",
          dateText: "នorg/កម្មវិទ្យា១រីន",
        ),
        const SizedBox(height: 12),

        // Card 4 - Grammar
        _buildHomeworkCard(
          icon: Icons.auto_awesome,
          iconColor: AppColors.orange,
          iconBgColor: const Color(0xFFFFF3E0),
          title: "បញ្ជាកសុសន្ធ",
          tag: "និទ្ទេស: A",
          tagColor: AppColors.primaryMain,
          tagBgColor: AppColors.primaryBg,
          subtitle: "ភាសាអង់គ្លេស",
          dateText: "២បា តុលា",
        ),
      ],
    );
  }

  // ==================== NEW QUIZZES SECTION ====================
  Widget _buildNewQuizzesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text("កម្រងសំណួរថ្មីៗ", style: AppTextStyle.subtitle18),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.errorBG,
                borderRadius: BorderRadius.circular(AppNumber.radiusRounded),
              ),
              child: Text(
                "ទើបផ្ដើមអស់",
                style: GoogleFonts.kantumruyPro(
                  fontSize: 12,
                  color: AppColors.error,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Quiz card 1 - Science
        _buildQuizCard(
          icon: Icons.science,
          iconColor: AppColors.success,
          iconBgColor: AppColors.successBG,
          title: "វិទ្យាសាស្រ្ត មេរៀនទី១៦",
          score: "៨៥%",
          scoreColor: AppColors.success,
          stats: "២០ តុលា • ២០ សំណួរ",
          tag: "ល្អបំផុត",
          tagColor: AppColors.success,
          tagBgColor: AppColors.successBG,
        ),
        const SizedBox(height: 12),

        // Quiz card 2 - Geography
        _buildQuizCard(
          icon: Icons.music_note,
          iconColor: AppColors.primaryMain,
          iconBgColor: AppColors.primaryBg,
          title: "ចំណេះដឹងភូមិសាស្រ្ត",
          score: "90/90",
          scoreColor: AppColors.primaryMain,
          stats: "១៩ តុលា • ១០ សំណួរ",
          tag: "ល្អបំផុត",
          tagColor: AppColors.primaryMain,
          tagBgColor: AppColors.primaryBg,
        ),
      ],
    );
  }

  // ==================== HOMEWORK CARD WIDGET ====================
  Widget _buildHomeworkCard({
    required IconData icon,
    required Color iconColor,
    required Color iconBgColor,
    required String title,
    required String tag,
    required Color tagColor,
    required Color tagBgColor,
    required String subtitle,
    bool hasTimeInfo = false,
    String? timeText,
    bool hasButton = false,
    String? buttonText,
    Color? accentColor,
    String? dateText,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AppNumber.radiusLarge),
        border: accentColor != null
            ? Border(left: BorderSide(color: accentColor, width: 4))
            : null,
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Icon
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: iconBgColor,
                    borderRadius: BorderRadius.circular(AppNumber.radiusSmall),
                  ),
                  child: Icon(icon, color: iconColor, size: 20),
                ),
                const SizedBox(width: 10),
                // Title + Tag + Subtitle
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(title,
                                style: AppTextStyle.subtitle16,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: tagBgColor,
                              borderRadius: BorderRadius.circular(
                                  AppNumber.radiusRounded),
                            ),
                            child: Text(
                              tag,
                              style: GoogleFonts.kantumruyPro(
                                fontSize: 11,
                                color: tagColor,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(subtitle, style: AppTextStyle.caption13Secondary),
                    ],
                  ),
                ),
              ],
            ),
            if (hasTimeInfo && timeText != null) ...[
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.only(left: 46),
                child: Row(
                  children: [
                    Icon(Icons.access_time,
                        size: 14, color: AppColors.secondaryText),
                    const SizedBox(width: 4),
                    Text(timeText, style: AppTextStyle.caption12Secondary),
                  ],
                ),
              ),
            ],
            if (dateText != null) ...[
              const SizedBox(height: 4),
              Padding(
                padding: const EdgeInsets.only(left: 46),
                child: Text(dateText, style: AppTextStyle.caption12Secondary),
              ),
            ],
            if (hasButton && buttonText != null) ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        backgroundColor: accentColor ?? AppColors.success,
                        foregroundColor: AppColors.white,
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(AppNumber.radiusMedium),
                        ),
                        elevation: 0,
                      ),
                      child: Text(
                        buttonText,
                        style: GoogleFonts.kantumruyPro(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: (accentColor ?? AppColors.success)
                          .withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.info_outline,
                        size: 18, color: accentColor ?? AppColors.success),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  // ==================== QUIZ CARD WIDGET ====================
  Widget _buildQuizCard({
    required IconData icon,
    required Color iconColor,
    required Color iconBgColor,
    required String title,
    required String score,
    required Color scoreColor,
    required String stats,
    required String tag,
    required Color tagColor,
    required Color tagBgColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AppNumber.radiusLarge),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: iconBgColor,
              borderRadius: BorderRadius.circular(AppNumber.radiusSmall),
            ),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          const SizedBox(width: 12),
          // Title + Stats + Tag
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: AppTextStyle.subtitle16,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(stats, style: AppTextStyle.caption12Secondary),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: tagBgColor,
                        borderRadius:
                            BorderRadius.circular(AppNumber.radiusRounded),
                      ),
                      child: Text(
                        tag,
                        style: GoogleFonts.kantumruyPro(
                          fontSize: 11,
                          color: tagColor,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          // Score
          Text(
            score,
            style: GoogleFonts.kantumruyPro(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: scoreColor,
            ),
          ),
        ],
      ),
    );
  }
}
