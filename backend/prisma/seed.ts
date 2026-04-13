import { PrismaClient, CategoryType } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
  // Expense categories
  { name: "Makanan & Minuman", type: CategoryType.expense, icon: "🍔", color: "#EF4444" },
  { name: "Transportasi", type: CategoryType.expense, icon: "🚗", color: "#F97316" },
  { name: "Belanja", type: CategoryType.expense, icon: "🛒", color: "#F59E0B" },
  { name: "Tagihan & Utilitas", type: CategoryType.expense, icon: "💡", color: "#EAB308" },
  { name: "Kesehatan", type: CategoryType.expense, icon: "🏥", color: "#22C55E" },
  { name: "Hiburan", type: CategoryType.expense, icon: "🎮", color: "#14B8A6" },
  { name: "Pendidikan", type: CategoryType.expense, icon: "📚", color: "#3B82F6" },
  { name: "Rumah Tangga", type: CategoryType.expense, icon: "🏠", color: "#6366F1" },
  { name: "Pakaian", type: CategoryType.expense, icon: "👕", color: "#8B5CF6" },
  { name: "Donasi", type: CategoryType.expense, icon: "💝", color: "#EC4899" },
  { name: "Investasi", type: CategoryType.expense, icon: "📊", color: "#06B6D4" },
  { name: "Lainnya", type: CategoryType.expense, icon: "📦", color: "#6B7280" },
  // Income categories
  { name: "Gaji", type: CategoryType.income, icon: "💼", color: "#22C55E" },
  { name: "Freelance", type: CategoryType.income, icon: "💻", color: "#3B82F6" },
  { name: "Bisnis", type: CategoryType.income, icon: "🏪", color: "#F97316" },
  { name: "Investasi", type: CategoryType.income, icon: "📈", color: "#14B8A6" },
  { name: "Hadiah", type: CategoryType.income, icon: "🎁", color: "#EC4899" },
  { name: "Lainnya", type: CategoryType.income, icon: "📦", color: "#6B7280" },
];

async function main() {
  console.log("🌱 Seeding default categories...");

  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: {
        id: `default-${category.type}-${category.name.toLowerCase().replace(/\s/g, "-")}`,
      },
      update: {},
      create: {
        id: `default-${category.type}-${category.name.toLowerCase().replace(/\s/g, "-")}`,
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
        isDefault: true,
        userId: null,
      },
    });
  }

  console.log(`✅ Seeded ${defaultCategories.length} default categories`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
