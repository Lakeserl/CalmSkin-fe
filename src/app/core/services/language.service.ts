import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  readonly currentLang = signal<'vi' | 'en'>((localStorage.getItem('calmskin_lang') as 'vi' | 'en') || 'vi');

  // Complete translation dictionary
  private readonly translations = {
    vi: {
      // Common & Navigation
      'nav.brand': 'CalmSKIN',
      'nav.home': 'Trang Chủ',
      'nav.products': 'Mỹ Phẩm',
      'nav.cart': 'Giỏ Hàng',
      'nav.profile': 'Hồ Sơ',
      'nav.admin': 'Quản Trị',
      'nav.login': 'Đăng Nhập',
      'nav.register': 'Đăng Ký',
      'nav.logout': 'Đăng Xuất',
      'nav.searchPlaceholder': 'Tìm kiếm tinh chất, serum phù hợp...',

      // Home Page
      'home.bannerSub': 'Tinh Chất Thiên Nhiên Đột Phá',
      'home.bannerTitle': 'Tái Sinh Sinh Khí Làn Da Việt',
      'home.bannerDesc': 'Sản phẩm dịu lành được thiết kế dành riêng cho làn da nhạy cảm của phái đẹp Á Đông. 100% kiểm nghiệm khoa học.',
      'home.shopNow': 'Mua Ngay',
      'home.explore': 'Khám Phá Dòng Sản Phẩm',
      'home.bestSellers': 'Mỹ Phẩm Bán Chạy Nhất',
      'home.bestSellersSub': 'Những dòng tinh chất được phái đẹp yêu chuộng và đánh giá cao nhất.',
      'home.newArrivals': 'Sản Phẩm Mới Về',
      'home.newArrivalsSub': 'Trải nghiệm những công thức phục hồi và cấp ẩm sinh học mới nhất.',
      'home.addToCart': 'Thêm Vào Giỏ',
      'home.outOfStock': 'Hết Hàng',

      // Profile Page
      'profile.title': 'Tài Khoản Của Bạn',
      'profile.tier': 'Thành Viên',
      'profile.points': 'Điểm tích lũy:',
      'profile.nextTierTip': 'Tích thêm {points} xu để nâng hạng thành viên tiếp theo.',
      'profile.tabInfo': 'Cập nhật hồ sơ',
      'profile.tabLoyalty': 'Nhật ký tích điểm',
      'profile.tabAddress': 'Sổ địa chỉ nhận hàng',
      'profile.changeAvatar': 'Đổi ảnh',
      
      // Profile -> Info Form
      'profile.infoHeading': 'Thông Tin Cá Nhân',
      'profile.fullName': 'Họ và Tên',
      'profile.phone': 'Số Điện Thoại',
      'profile.gender': 'Giới Tính',
      'profile.genderFemale': 'Nữ',
      'profile.genderMale': 'Nam',
      'profile.genderOther': 'Khác',
      'profile.dob': 'Ngày Sinh',
      'profile.saveBtn': 'Lưu Thay Đổi',
      'profile.saving': 'Đang lưu...',

      // Profile -> Loyalty
      'profile.loyaltyHeading': 'Nhật Ký Tích Điểm',
      'profile.loyaltyDate': 'Ngày Giao Dịch',
      'profile.loyaltyType': 'Loại',
      'profile.loyaltyAmount': 'Số Xu',
      'profile.loyaltyDesc': 'Nội Dung',
      'profile.loyaltyEarn': 'TÍCH XU',
      'profile.loyaltySpend': 'TIÊU XU',

      // Profile -> Address
      'profile.addrHeading': 'Sổ Địa Chỉ Nhận Hàng',
      'profile.addrAddNew': '+ Thêm Địa Chỉ Mới',
      'profile.addrClose': 'Đóng form',
      'profile.addrReceiverName': 'Tên người nhận',
      'profile.addrPhone': 'Số điện thoại',
      'profile.addrProvince': 'Tỉnh / Thành',
      'profile.addrDistrict': 'Quận / Huyện',
      'profile.addrWard': 'Phường / Xã',
      'profile.addrStreet': 'Địa chỉ cụ thể (Số nhà, tên đường)',
      'profile.addrDefault': 'Đặt làm địa chỉ nhận hàng mặc định.',
      'profile.addrSave': 'Lưu địa chỉ',
      'profile.addrDelete': 'Xóa',
      'profile.addrIsDefault': 'Mặc định',

      // Footer
      'footer.desc': 'Thương hiệu mỹ phẩm thiên nhiên kết hợp công nghệ khoa học đột phá. Giúp tái tạo sinh khí làn da phụ nữ Việt một cách an toàn và bền vững nhất.',
      'footer.badgeAuthenticTitle': '100% Chính Hãng',
      'footer.badgeAuthenticDesc': 'Kiểm định thành phần nghiêm ngặt, an toàn cho da nhạy cảm.',
      'footer.badgeShippingTitle': 'Giao Hàng Miễn Phí',
      'footer.badgeShippingDesc': 'Miễn phí giao hàng cho đơn từ 500.000đ trên toàn quốc.',
      'footer.badgeReturnTitle': '30 Ngày Trả Hàng',
      'footer.badgeReturnDesc': 'Hỗ trợ trả hàng nếu có hiện tượng kích ứng rát đỏ.',
      'footer.colShop': 'Mua Sắm',
      'footer.colShopAll': 'Tất cả sản phẩm',
      'footer.colShopAcne': 'Dòng trị mụn',
      'footer.colShopAging': 'Chống lão hóa',
      'footer.colShopSerum': 'Tinh chất Serum',
      'footer.colPolicy': 'Chính Sách',
      'footer.colPolicyTerm': 'Điều khoản dịch vụ',
      'footer.colPolicyPrivacy': 'Chính sách bảo mật',
      'footer.colPolicyReturn': 'Quy trình đổi trả',
      'footer.colPolicyLoyalty': 'Chương trình tích xu',
      'footer.colNewsletter': 'Đăng ký Nhận Bản Tin',
      'footer.newsletterDesc': 'Nhận thông tin cập nhật về các sản phẩm mới và chương trình ưu đãi dành riêng cho thành viên.',
      'footer.newsletterPlaceholder': 'Email của bạn...',
      'footer.newsletterSend': 'Gửi',

      // Admin Layout
      'admin.title': 'CalmSKIN Admin',
      'admin.menuDashboard': '📊 Bảng Điều Khiển',
      'admin.menuProducts': '📦 Quản Lý Mỹ Phẩm',
      'admin.menuOrders': '🧾 Duyệt Đơn Hàng',
      'admin.menuInventory': '🚚 Quản Lý Tồn Kho',
      'admin.backToShop': '🛍️ Về Cửa Hàng'
    },
    en: {
      // Common & Navigation
      'nav.brand': 'CalmSKIN',
      'nav.home': 'Home',
      'nav.products': 'Skincare',
      'nav.cart': 'Cart',
      'nav.profile': 'Profile',
      'nav.admin': 'Admin',
      'nav.login': 'Login',
      'nav.register': 'Register',
      'nav.logout': 'Logout',
      'nav.searchPlaceholder': 'Search for serums, formulas...',

      // Home Page
      'home.bannerSub': 'Breakthrough Natural Elixir',
      'home.bannerTitle': 'Rebirth of Skincare Vitality',
      'home.bannerDesc': 'Gentle, scientific formula designed specifically for Asian women\'s sensitive skin. 100% dermatologically tested.',
      'home.shopNow': 'Shop Now',
      'home.explore': 'Explore Skincare Lines',
      'home.bestSellers': 'Best Selling Skincare',
      'home.bestSellersSub': 'Our most loved and highly-rated serums favored by beauty experts.',
      'home.newArrivals': 'New Arrivals',
      'home.newArrivalsSub': 'Experience the latest bio-recovery and hydrating formulas.',
      'home.addToCart': 'Add to Cart',
      'home.outOfStock': 'Out of Stock',

      // Profile Page
      'profile.title': 'Your Personal Account',
      'profile.tier': 'Tier',
      'profile.points': 'Accumulated Points:',
      'profile.nextTierTip': 'Earn {points} more points to upgrade to next membership tier.',
      'profile.tabInfo': 'Update Profile',
      'profile.tabLoyalty': 'Loyalty History',
      'profile.tabAddress': 'Address Book',
      'profile.changeAvatar': 'Edit Photo',

      'profile.infoHeading': 'Personal Information',
      'profile.fullName': 'Full Name',
      'profile.phone': 'Phone Number',
      'profile.gender': 'Gender',
      'profile.genderFemale': 'Female',
      'profile.genderMale': 'Male',
      'profile.genderOther': 'Other',
      'profile.dob': 'Date of Birth',
      'profile.saveBtn': 'Save Changes',
      'profile.saving': 'Saving...',

      'profile.loyaltyHeading': 'Loyalty Point Ledger',
      'profile.loyaltyDate': 'Date',
      'profile.loyaltyType': 'Type',
      'profile.loyaltyAmount': 'Points',
      'profile.loyaltyDesc': 'Description',
      'profile.loyaltyEarn': 'EARN COIN',
      'profile.loyaltySpend': 'SPEND COIN',

      'profile.addrHeading': 'Shipping Addresses',
      'profile.addrAddNew': '+ Add New Address',
      'profile.addrClose': 'Close form',
      'profile.addrReceiverName': 'Recipient name',
      'profile.addrPhone': 'Phone number',
      'profile.addrProvince': 'Province / City',
      'profile.addrDistrict': 'District',
      'profile.addrWard': 'Ward',
      'profile.addrStreet': 'Specific Address (Street, House No.)',
      'profile.addrDefault': 'Set as default shipping address.',
      'profile.addrSave': 'Save Address',
      'profile.addrDelete': 'Delete',
      'profile.addrIsDefault': 'Default',

      'footer.desc': 'A nature-infused brand combined with cutting-edge dermatology. Safely and sustainably rejuvenating Vietnamese skin.',
      'footer.badgeAuthenticTitle': '100% Genuine',
      'footer.badgeAuthenticDesc': 'Strict ingredient vetting, perfectly safe for sensitive skin.',
      'footer.badgeShippingTitle': 'Free Delivery',
      'footer.badgeShippingDesc': 'Free shipping nationwide for orders from 500,000đ.',
      'footer.badgeReturnTitle': '30-Day Returns',
      'footer.badgeReturnDesc': 'Hassle-free returns if redness or irritation occurs.',
      'footer.colShop': 'Shopping',
      'footer.colShopAll': 'All products',
      'footer.colShopAcne': 'Acne Solutions',
      'footer.colShopAging': 'Anti-Aging',
      'footer.colShopSerum': 'Serums',
      'footer.colPolicy': 'Policy',
      'footer.colPolicyTerm': 'Terms of Service',
      'footer.colPolicyPrivacy': 'Privacy Policy',
      'footer.colPolicyReturn': 'Return Policy',
      'footer.colPolicyLoyalty': 'Loyalty Rewards',
      'footer.colNewsletter': 'Newsletter',
      'footer.newsletterDesc': 'Receive updates on new formulas and exclusive offers for members.',
      'footer.newsletterPlaceholder': 'Your email address...',
      'footer.newsletterSend': 'Send',

      'admin.title': 'CalmSKIN Admin',
      'admin.menuDashboard': '📊 Dashboard',
      'admin.menuProducts': '📦 Products',
      'admin.menuOrders': '🧾 Orders Approval',
      'admin.menuInventory': '🚚 Stock Control',
      'admin.backToShop': '🛍️ Back to Shop'
    }
  };

  readonly t = computed(() => this.translations[this.currentLang()]);

  setLanguage(lang: 'vi' | 'en') {
    this.currentLang.set(lang);
    localStorage.setItem('calmskin_lang', lang);
  }

  translate(key: string, params?: Record<string, any>): string {
    const dictionary = this.t() as any;
    let translation = dictionary[key] || key;
    if (params) {
      Object.keys(params).forEach(p => {
        translation = translation.replace(`{${p}}`, params[p]);
      });
    }
    return translation;
  }
}
