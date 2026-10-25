import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { getDatabaseConfig } from '../config/database.config';
import { Role } from '../modules/roles/entities/role.entity';
import { User } from '../modules/users/entities/user.entity';
import { IngredientCategory } from '../modules/categories/entities/category.entity';
import { Ingredient } from '../modules/ingredients/entities/ingredient.entity';
import { Supplier } from '../modules/suppliers/entities/supplier.entity';
import { Beverage } from '../modules/beverages/entities/beverage.entity';
import { UserRoleEnum } from '../common/enums/system.enum';

async function runSeed() {
  console.log('🌱 Đang khởi tạo kết nối Database để Seed dữ liệu...');
  const options = getDatabaseConfig() as any;
  const dataSource = new DataSource(options);

  await dataSource.initialize();
  console.log('✅ Kết nối Database thành công!');

  const roleRepo = dataSource.getRepository(Role);
  const userRepo = dataSource.getRepository(User);
  const categoryRepo = dataSource.getRepository(IngredientCategory);
  const ingredientRepo = dataSource.getRepository(Ingredient);
  const supplierRepo = dataSource.getRepository(Supplier);
  const beverageRepo = dataSource.getRepository(Beverage);

  // 1. Seed Roles
  console.log('📦 Seeding Roles...');
  const rolesMap = new Map<UserRoleEnum, Role>();
  for (const roleName of Object.values(UserRoleEnum)) {
    let role = await roleRepo.findOne({ where: { name: roleName } });
    if (!role) {
      role = roleRepo.create({
        name: roleName,
        description: `Quyền ${roleName} trong hệ thống`,
      });
      await roleRepo.save(role);
    }
    rolesMap.set(roleName, role);
  }

  // 2. Seed Users
  console.log('👤 Seeding Default Users...');
  const defaultPasswordHash = await bcrypt.hash('Admin@123', 10);

  const usersData = [
    { email: 'admin@coffee.com', fullName: 'Quản trị viên Hệ thống', role: rolesMap.get(UserRoleEnum.ADMIN)! },
    { email: 'manager@coffee.com', fullName: 'Quản lý Kho Cà phê', role: rolesMap.get(UserRoleEnum.WAREHOUSE_MANAGER)! },
    { email: 'staff@coffee.com', fullName: 'Nhân viên Pha chế', role: rolesMap.get(UserRoleEnum.STAFF)! },
  ];

  for (const u of usersData) {
    const existing = await userRepo.findOne({ where: { email: u.email } });
    if (!existing) {
      await userRepo.save(
        userRepo.create({
          email: u.email,
          fullName: u.fullName,
          passwordHash: defaultPasswordHash,
          roleId: u.role.id,
          isActive: true,
        }),
      );
      console.log(` -> Đã tạo tài khoản mẫu: ${u.email} (Mật khẩu: Admin@123)`);
    }
  }

  // 3. Seed Ingredient Categories
  console.log('🏷️ Seeding Ingredient Categories...');
  const categoriesData = [
    { name: 'Hạt Cà Phê', description: 'Các loại hạt cà phê nguyên chất, arabica, robusta' },
    { name: 'Sữa & Bơ', description: 'Sữa tươi, sữa đặc, kem béo, bơ thực vật' },
    { name: 'Siro & Đường', description: 'Đường nước, các loại syrup pha chế' },
    { name: 'Trà & Khác', description: 'Trà đen, trà xanh, mứt quả, bột cacao' },
  ];

  const categoryEntities: IngredientCategory[] = [];
  for (const cat of categoriesData) {
    let category = await categoryRepo.findOne({ where: { name: cat.name } });
    if (!category) {
      category = await categoryRepo.save(categoryRepo.create(cat));
    }
    categoryEntities.push(category);
  }

  // 4. Seed Suppliers
  console.log('🏭 Seeding Suppliers...');
  const suppliersData = [
    { name: 'Công ty Cổ phần Cà phê Trung Nguyên', phone: '02839251888', email: 'nhapkhotn@trungnguyen.vn', address: 'Quận 1, TP. Hồ Chí Minh' },
    { name: 'Công ty Cổ phần Sữa Việt Nam (Vinamilk)', phone: '02854155555', email: 'sales@vinamilk.com.vn', address: 'Quận 7, TP. Hồ Chí Minh' },
  ];

  for (const sup of suppliersData) {
    const existing = await supplierRepo.findOne({ where: { name: sup.name } });
    if (!existing) {
      await supplierRepo.save(supplierRepo.create(sup));
    }
  }

  // 5. Seed Initial Ingredients
  console.log('🧪 Seeding Sample Ingredients...');
  const ingredientsData = [
    { code: 'ING-001', name: 'Hạt Cà Phê Robusta Nguyên Chất', category: categoryEntities[0], baseUnit: 'kg', minStockLevel: 5.0, currentStock: 0 },
    { code: 'ING-002', name: 'Sữa Tươi Thanh Trùng Vinamilk 1L', category: categoryEntities[1], baseUnit: 'hop', minStockLevel: 10.0, currentStock: 0 },
    { code: 'ING-003', name: 'Đường Nước Pha Chế', category: categoryEntities[2], baseUnit: 'ml', minStockLevel: 2000.0, currentStock: 0 },
    { code: 'ING-004', name: 'Syrup Vanilla Monin', category: categoryEntities[2], baseUnit: 'ml', minStockLevel: 1000.0, currentStock: 0 },
  ];

  for (const ing of ingredientsData) {
    const existing = await ingredientRepo.findOne({ where: { code: ing.code } });
    if (!existing) {
      await ingredientRepo.save(
        ingredientRepo.create({
          code: ing.code,
          name: ing.name,
          categoryId: ing.category.id,
          baseUnit: ing.baseUnit,
          minStockLevel: ing.minStockLevel,
          currentStock: ing.currentStock,
        }),
      );
    }
  }

  // 6. Seed Sample Beverages
  console.log('☕ Seeding Sample Beverages...');
  const beveragesData = [
    { code: 'BEV-001', name: 'Cà Phê Sữa Đá Sài Gòn', sellingPrice: 29000, estimatedCost: 8500 },
    { code: 'BEV-002', name: 'Bạc Xỉu Đá Premium', sellingPrice: 35000, estimatedCost: 10500 },
  ];

  for (const bev of beveragesData) {
    const existing = await beverageRepo.findOne({ where: { code: bev.code } });
    if (!existing) {
      await beverageRepo.save(beverageRepo.create(bev));
    }
  }

  console.log('🎉 ĐÃ HOÀN THÀNH SEED DỮ LIỆU MẪU DỰ ÁN KHO CÀ PHÊ!');
  await dataSource.destroy();
}

runSeed().catch((err) => {
  console.error('❌ Lỗi khi seed dữ liệu:', err);
  process.exit(1);
});