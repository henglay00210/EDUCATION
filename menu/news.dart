import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:tamdansers_app/constants/app_colors.dart';
import 'package:tamdansers_app/constants/app_number.dart';
import 'package:tamdansers_app/constants/text_style.dart';

class NewsScreen extends StatefulWidget {
  const NewsScreen({super.key});

  @override
  State<NewsScreen> createState() => _NewsScreenState();
}

class _NewsScreenState extends State<NewsScreen> {
  int _selectedCategory = 0;

  final List<String> _categories = [
    "ទាំងអស់",
    "សាលា",
    "ថ្នា",
    "ព្រឹត្តិ",
  ];

  final List<Map<String, dynamic>> _newsItems = [
    {
      "category": "សារប្រចាំសារ​​​​​​​​​​​",
      "categoryColor": AppColors.primaryMain,
      "categoryBgColor": AppColors.primaryBg,
      "title": "ការប្បវេសប៍ចេញប្រឡងសណ្ដាប់វិទ្យា",
      "description":
          "សារប្រឡងសណ្ដាប់វិទ្យាដែលថ្ងៃទី៦ខែមករាស្បូទប្បល កោរខឺវ​រពេលវួក្រការអារាស​វ៍ព្រកានៗ។",
      "author": "លោក សុខ",
      "hasImage": false,
      "icon": Icons.campaign,
      "iconColor": AppColors.primaryMain,
    },
    {
      "category": "ព្រៃចម្បូទប៍ម៍និទព្រេន",
      "categoryColor": AppColors.pepure,
      "categoryBgColor": AppColors.lightPink,
      "title": "ការប្រកួតពល់ទាត់",
      "description":
          "សារប្រុកាុយែលង​វោតាំមនែសនារីកាុវ៉ៃផ្ដើមនួរនៅ សល្បរះ​ រ សួប្រារម​ទមន​ៃធកៃរីង​ក៍ការ់អណ់ស៍អែល​អ​​។",
      "author": "ថ្នាក់វិទ្យា",
      "hasImage": false,
      "icon": Icons.emoji_events,
      "iconColor": AppColors.pepure,
    },
    {
      "category": "តារព៍ន៍",
      "categoryColor": AppColors.success,
      "categoryBgColor": AppColors.successBG,
      "title": "ការប្រជុំមាតាបិត និទក្រូ",
      "description":
          "បារតារពហ៌ចែសស្សួម្រាប់ថៅសៅរីកា​រប្រញា​​ រាប៍ក រាម​ ៦ ម៉ឺក​ នៅសាលា​សួប្រជុំវិទារណ៍​።",
      "author": "ល្បួនការណៃ​",
      "hasImage": false,
      "icon": Icons.groups,
      "iconColor": AppColors.success,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding:
                const EdgeInsets.symmetric(horizontal: AppNumber.screenPadding),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),
                _buildHeader(),
                const SizedBox(height: 16),
                _buildSearchBar(),
                const SizedBox(height: 14),
                _buildCategoryChips(),
                const SizedBox(height: 16),
                _buildFeaturedCard(),
                const SizedBox(height: 20),
                _buildLatestUpdatesHeader(),
                const SizedBox(height: 12),
                _buildNewsList(),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ==================== HEADER ====================
  Widget _buildHeader() {
    return Row(
      children: [
        Text("ព័ត៌មាន", style: AppTextStyle.screenTitle24),
        const Spacer(),
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.white,
            border: Border.all(color: AppColors.lightgrey),
          ),
          child: const Icon(Icons.notifications_none,
              size: 22, color: AppColors.primaryText),
        ),
        const SizedBox(width: 10),
        Container(
          width: 40,
          height: 40,
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
                size: 22,
              ),
            ),
          ),
        ),
      ],
    );
  }

  // ==================== SEARCH BAR ====================
  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 0),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AppNumber.radiusMedium),
        border: Border.all(color: AppColors.lightgrey),
      ),
      child: Row(
        children: [
          const Icon(Icons.search, size: 22, color: AppColors.secondaryText),
          const SizedBox(width: 10),
          Expanded(
            child: TextField(
              decoration: InputDecoration(
                hintText: "ស្វែងរកការប្រកាស...",
                hintStyle: AppTextStyle.hint15,
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
              ),
              style: AppTextStyle.body,
            ),
          ),
        ],
      ),
    );
  }

  // ==================== CATEGORY CHIPS ====================
  Widget _buildCategoryChips() {
    return Row(
      children: List.generate(_categories.length, (index) {
        final isSelected = _selectedCategory == index;
        return Padding(
          padding: const EdgeInsets.only(right: 8),
          child: GestureDetector(
            onTap: () => setState(() => _selectedCategory = index),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primaryMain : AppColors.white,
                borderRadius: BorderRadius.circular(AppNumber.radiusPill),
                border: Border.all(
                  color:
                      isSelected ? AppColors.primaryMain : AppColors.lightgrey,
                ),
              ),
              child: Text(
                _categories[index],
                style: GoogleFonts.kantumruyPro(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: isSelected ? AppColors.white : AppColors.primaryText,
                ),
              ),
            ),
          ),
        );
      }),
    );
  }

  // ==================== FEATURED CARD ====================
  Widget _buildFeaturedCard() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppNumber.radiusLarge),
        color: const Color(0xFF1C1C3A),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          // Background overlay
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black.withValues(alpha: 0.7),
                  ],
                ),
              ),
            ),
          ),
          // Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // "New" badge
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.error,
                    borderRadius:
                        BorderRadius.circular(AppNumber.radiusRounded),
                  ),
                  child: Text(
                    "ថ្មី ចុង",
                    style: GoogleFonts.kantumruyPro(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 50),
                // Title
                Text(
                  "កិឈវណ៍វិទ្យាសាស្រ្តប្រចាំឆ្នាំ ២០២៥",
                  style: GoogleFonts.kantumruyPro(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.white,
                  ),
                ),
                const SizedBox(height: 6),
                // Description
                Text(
                  "ចូលមួយបើកផ្សញ​បម្រាប់នៃថ្ងៃនាក​វ៍ផូទល់មី​​ នីការម​​​រ របឞ្ញ។",
                  style: GoogleFonts.kantumruyPro(
                    fontSize: 13,
                    fontWeight: FontWeight.w400,
                    color: Colors.white70,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ==================== LATEST UPDATES HEADER ====================
  Widget _buildLatestUpdatesHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text("បច្ចុប្បន្នភាពថ្មីៗ", style: AppTextStyle.subtitle18),
        Text(
          "សម្ពាល់ពាក្យទាំងអស់",
          style: GoogleFonts.kantumruyPro(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: AppColors.primaryMain,
          ),
        ),
      ],
    );
  }

  // ==================== NEWS LIST ====================
  Widget _buildNewsList() {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _newsItems.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final item = _newsItems[index];
        return _buildNewsCard(item);
      },
    );
  }

  Widget _buildNewsCard(Map<String, dynamic> item) {
    return Container(
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
              // Icon
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: item["categoryBgColor"],
                  borderRadius: BorderRadius.circular(AppNumber.radiusSmall),
                ),
                child: Icon(item["icon"], color: item["iconColor"], size: 20),
              ),
              const SizedBox(width: 10),
              // Category + Title
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Category badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: item["categoryBgColor"],
                        borderRadius:
                            BorderRadius.circular(AppNumber.radiusRounded),
                      ),
                      child: Text(
                        item["category"],
                        style: GoogleFonts.kantumruyPro(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: item["categoryColor"],
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      item["title"],
                      style: AppTextStyle.subtitle16,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Description
          Padding(
            padding: const EdgeInsets.only(left: 46),
            child: Text(
              item["description"],
              style: AppTextStyle.caption13Secondary,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(height: 10),
          // Author + Read more
          Padding(
            padding: const EdgeInsets.only(left: 46),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  item["author"],
                  style: AppTextStyle.caption12Secondary,
                ),
                Text(
                  "អានបន្ថែម",
                  style: GoogleFonts.kantumruyPro(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AppColors.primaryMain,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
