import 'package:flutter/material.dart';
import 'package:tamdansers_app/constants/app_colors.dart';
import 'package:tamdansers_app/constants/text_style.dart';
import 'package:tamdansers_app/routes/app_routes.dart';

class ParentsDashboard extends StatelessWidget {
  const ParentsDashboard({super.key});
  double _fs(double base, BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    return base * (width / 390).clamp(0.78, 1.15);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: double.infinity,
                  padding: EdgeInsets.only(
                    top: MediaQuery.of(context).padding.top + 12,
                    left: 16,
                    right: 16,
                    bottom: 70,
                  ),
                  decoration: const BoxDecoration(
                    color: AppColors.primary300,
                    borderRadius:
                        BorderRadius.vertical(bottom: Radius.circular(24)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              "ថ្ងៃចន្ទ ទី5 ខែមករា ឆ្នាំ2026",
                              style: AppTextStyle.body18White
                                  .copyWith(fontSize: _fs(12, context)),
                            ),
                          ),
                          _circleIcon(Icons.notifications_none, context),
                          const SizedBox(width: 10),
                          Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border:
                                  Border.all(color: AppColors.white, width: 2),
                            ),
                            child: ClipOval(
                              child: Image.asset(
                                'assets/images/profile_placeholder.png',
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) =>
                                    Icon(Icons.person,
                                        color: AppColors.white, size: 22),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        "អរុណសួស្តី",
                        style: AppTextStyle.title28White.copyWith(
                            fontSize: _fs(22, context),
                            fontWeight: FontWeight.w600),
                      ),
                      Text(
                        "លោក ឡាយ",
                        style: AppTextStyle.title28White.copyWith(
                            fontSize: _fs(22, context),
                            fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                Positioned(
                  left: 24,
                  right: 24,
                  bottom: -100,
                  child: _studentCard(context),
                ),
              ],
            ),
            const SizedBox(height: 116),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("សកម្មភាពលឿន",
                      style: AppTextStyle.sectionTitle20
                          .copyWith(fontSize: _fs(16, context))),
                  Text("មើលទាំងអស់",
                      style: AppTextStyle.body.copyWith(
                        color: AppColors.primaryMain,
                        fontSize: _fs(13, context),
                        fontWeight: FontWeight.w500,
                      )),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _quickActionTile("វត្តមាន", Icons.date_range,
                      AppColors.primaryMain, context, onTap: () {
                    Navigator.pushNamed(context, AppRoutes.attandanceChild);
                  }),
                  _quickActionTile(
                      "លទ្ធផល", Icons.assessment, AppColors.success, context,
                      onTap: () {
                    Navigator.pushNamed(context, AppRoutes.homeworkQuizeScreen);
                  }),
                  _quickActionTile(
                      "ព័ត៌មាន", Icons.campaign, AppColors.pepure, context,
                      onTap: () {
                    Navigator.pushNamed(context, AppRoutes.newsScreen);
                  }),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text("សកម្មភាពថ្មីៗ",
                  style: AppTextStyle.sectionTitle20
                      .copyWith(fontSize: _fs(16, context))),
            ),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _recentActivity(context),
            ),
            const SizedBox(height: 16),
            Center(
              child: Text(
                "មើលការផ្សេងៗដែលពាក់ព័ន្ធ",
                style: AppTextStyle.body.copyWith(
                  color: AppColors.secondaryText,
                  fontSize: _fs(13, context),
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
      bottomNavigationBar: _bottomNav(context),
    );
  }

  Widget _studentCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Stack(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.primaryBg,
                    ),
                    child: ClipOval(
                      child: Image.asset(
                        'assets/images/profile_placeholder.png',
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Icon(
                            Icons.person,
                            size: 36,
                            color: AppColors.primaryMain),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    left: 0,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        color: AppColors.success,
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.white, width: 2),
                      ),
                      child: const Icon(Icons.check,
                          color: AppColors.white, size: 12),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("លោក ឡាយ",
                        style: AppTextStyle.subtitle16.copyWith(
                          fontSize: _fs(16, context),
                          fontWeight: FontWeight.w700,
                        )),
                    const SizedBox(height: 2),
                    Text("ថ្នាក់ទី 5A ID: #29384",
                        style: AppTextStyle.body.copyWith(
                          fontSize: _fs(13, context),
                          color: AppColors.secondaryText,
                        )),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.successBG,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.check_circle,
                              color: AppColors.success, size: 14),
                          const SizedBox(width: 4),
                          Text("ចូលនិស្សិត- 7:45 AM",
                              style: AppTextStyle.body.copyWith(
                                color: AppColors.success,
                                fontSize: _fs(12, context),
                                fontWeight: FontWeight.w600,
                              )),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _statItem("៩៨%", "វត្តមាន", AppColors.success, context),
              Container(
                  width: 1,
                  height: 30,
                  color: AppColors.neutral500.withOpacity(0.3)),
              _statItem("A", "និទ្ទេស", AppColors.primaryMain, context),
              Container(
                  width: 1,
                  height: 30,
                  color: AppColors.neutral500.withOpacity(0.3)),
              _statItem("ល", "អត្តចរិត", AppColors.success, context),
            ],
          ),
        ],
      ),
    );
  }

  Widget _quickActionTile(
      String title, IconData icon, Color color, BuildContext context,
      {VoidCallback? onTap}) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: color, size: 28),
              ),
              const SizedBox(height: 10),
              Text(
                title,
                textAlign: TextAlign.center,
                style: AppTextStyle.body.copyWith(
                  fontSize: _fs(13, context),
                  fontWeight: FontWeight.w600,
                  color: AppColors.primaryText,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _recentActivity(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          _activityItem(
            icon: Icons.assignment,
            title: "សិស្សលទ្ធផលប្រឡងលម្អិត",
            subtitle: "សិស្សលទ្ធផល 18/20 នៅលើការសាកល្បងផ្នែក ៤",
            time: "២ម៉ោង",
            iconColor: AppColors.orange,
            context: context,
          ),
          Divider(height: 1, color: AppColors.lightgrey),
          _activityItem(
            icon: Icons.notifications,
            title: "សាលបិទថ្ងៃស័ក្តិ្វ",
            subtitle: "ថ្ងៃឈប់សាធារណៈ",
            time: "ម្សិលមិញ",
            iconColor: AppColors.pepure,
            context: context,
          ),
        ],
      ),
    );
  }

  Widget _activityItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required String time,
    required Color iconColor,
    required BuildContext context,
  }) {
    return Padding(
      padding: const EdgeInsets.all(14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: AppTextStyle.subtitle16
                        .copyWith(fontSize: _fs(14, context))),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: AppTextStyle.body.copyWith(
                    fontSize: _fs(12, context),
                    color: AppColors.secondaryText,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(time,
              style: AppTextStyle.body.copyWith(
                fontSize: _fs(11, context),
                color: AppColors.secondaryText,
              )),
        ],
      ),
    );
  }

  Widget _statItem(
      String value, String label, Color color, BuildContext context) {
    return Column(
      children: [
        Text(value,
            style: AppTextStyle.stat32Bold.copyWith(
              fontSize: _fs(18, context),
              color: color,
            )),
        const SizedBox(height: 2),
        Text(label,
            style: AppTextStyle.body.copyWith(
              fontSize: _fs(11, context),
              color: AppColors.secondaryText,
            )),
      ],
    );
  }

  Widget _circleIcon(IconData icon, BuildContext context) {
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: AppColors.white.withOpacity(0.2),
      ),
      child: Icon(icon, color: AppColors.white, size: 20),
    );
  }

  Widget _bottomNav(BuildContext context) {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      currentIndex: 0,
      selectedItemColor: AppColors.primaryMain,
      unselectedItemColor: AppColors.secondaryText,
      selectedFontSize: _fs(12, context),
      unselectedFontSize: _fs(12, context),
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home), label: "ផ្ទះ"),
        BottomNavigationBarItem(icon: Icon(Icons.mail), label: "សារ"),
        BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today), label: "ប្រតិទិន"),
        BottomNavigationBarItem(icon: Icon(Icons.person), label: "ប្រវត្តិ"),
      ],
    );
  }
}
