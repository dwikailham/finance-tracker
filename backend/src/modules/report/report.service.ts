import prisma from "../../config/database.js";
import dayjs from "dayjs";

export class ReportService {
  /**
   * Mengambil ringkasan dashboard (total saldo, pemasukan, pengeluaran, transaksi terbaru)
   */
  async getDashboardSummary(userId: string) {
    const today = dayjs();
    const firstDayOfMonth = today.startOf("month").toDate();
    const lastDayOfMonth = today.endOf("month").toDate();

    // 1. Ambil list rekening beserta saldonya
    const accounts = await prisma.account.findMany({
      where: { userId, isArchived: false },
    });

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance.toNumber(), 0);

    // 2. Kalkulasi pemasukan & pengeluaran bulan ini
    const currentMonthAgg = await prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId,
        transactionDate: { gte: firstDayOfMonth, lte: lastDayOfMonth },
      },
      _sum: { amount: true },
    });

    const incomeAgg = currentMonthAgg.find((a) => a.type === "income");
    const expenseAgg = currentMonthAgg.find((a) => a.type === "expense");

    const income = incomeAgg?._sum.amount?.toNumber() || 0;
    const expense = expenseAgg?._sum.amount?.toNumber() || 0;

    // 3. 5 Transaksi Terakhir
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      take: 5,
      orderBy: { transactionDate: "desc" },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        account: { select: { id: true, name: true } },
      },
    });

    return {
      accounts,
      totalBalance,
      currentMonth: {
        income,
        expense,
        balance: income - expense,
      },
      recentTransactions,
    };
  }

  /**
   * Laporan komprehensif untuk satu bulan tertentu (Mingguan breakdown)
   */
  async getMonthlyReport(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    // Total income/expense
    const aggregates = await prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId,
        transactionDate: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    const incomeObj = aggregates.find((a) => a.type === "income");
    const expenseObj = aggregates.find((a) => a.type === "expense");
    
    const totalIncome = incomeObj?._sum.amount?.toNumber() || 0;
    const totalExpense = expenseObj?._sum.amount?.toNumber() || 0;

    // Hitung per minggu (kasar: 1-7, 8-14, 15-21, 22-end)
    const allCurrentMonthTransactions = await prisma.transaction.findMany({
       where: {
         userId,
         transactionDate: { gte: startDate, lte: endDate }
       },
       select: {
          transactionDate: true,
          type: true,
          amount: true
       }
    });

    const weeklyBreakdown = [1, 2, 3, 4].map(week => ({
       week,
       income: 0,
       expense: 0
    }));

    allCurrentMonthTransactions.forEach(t => {
       const date = t.transactionDate.getDate();
       let weekIndex = Math.floor((date - 1) / 7);
       if (weekIndex > 3) weekIndex = 3; // combine tail end of month into week 4
       
       if (t.type === "income") {
          weeklyBreakdown[weekIndex].income += t.amount.toNumber();
       } else if (t.type === "expense") {
          weeklyBreakdown[weekIndex].expense += t.amount.toNumber();
       }
    });

    // Top 5 Pengeluaran Terbesar
    const topExpenseCategoriesQuery = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: "expense",
        transactionDate: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    });

    const categoryIds = topExpenseCategoriesQuery.map(c => c.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds.filter(id => id !== null) as string[] } }
    });

    const topExpenseCategories = topExpenseCategoriesQuery.map(agg => {
      const cat = categories.find(c => c.id === agg.categoryId);
      const amount = agg._sum.amount?.toNumber() || 0;
      return {
        categoryId: agg.categoryId,
        name: cat?.name || "Uncategorized",
        icon: cat?.icon || "❓",
        color: cat?.color || "#d9d9d9",
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
      };
    });

    return {
      month,
      year,
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      weeklyBreakdown,
      topExpenseCategories,
    };
  }

  /**
   * Progress Tren Keuangan (6 Bulan)
   */
  async getTrend(userId: string, months: number = 6) {
    const end = dayjs();
    const start = end.subtract(months - 1, "month").startOf("month");

    const aggregates = await prisma.transaction.groupBy({
      by: ["type", "transactionDate"],
      where: {
        userId,
        transactionDate: { gte: start.toDate(), lte: end.toDate() },
      },
      _sum: { amount: true },
    });

    // Build timeline skeleton
    const trendMap = new Map<string, { month: number, year: number, monthLabel: string, income: number, expense: number }>();
    for (let i = 0; i < months; i++) {
        const d = start.add(i, "month");
        const key = d.format("YYYY-MM");
        trendMap.set(key, {
            month: d.month() + 1,
            year: d.year(),
            monthLabel: d.format("MMM YYYY"),
            income: 0,
            expense: 0
        });
    }

    aggregates.forEach(agg => {
       const d = dayjs(agg.transactionDate);
       const key = d.format("YYYY-MM");
       const entry = trendMap.get(key);
       if (entry) {
          if (agg.type === "income") {
              entry.income += agg._sum.amount?.toNumber() || 0;
          } else if (agg.type === "expense") {
              entry.expense += agg._sum.amount?.toNumber() || 0;
          }
       }
    });

    return Array.from(trendMap.values());
  }

  /**
   * Menampilkan Donut Chart pergerakan proporsi Kategori Expense
   */
  async getCategoryBreakdown(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const groupResult = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: "expense",
        transactionDate: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    const categoryIds = groupResult.map(g => g.categoryId).filter(Boolean) as string[];
    const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });

    const totalExpense = groupResult.reduce((sum, g) => sum + (g._sum.amount?.toNumber() || 0), 0);

    return groupResult.map(agg => {
       const cat = categories.find(c => c.id === agg.categoryId);
       const amount = agg._sum.amount?.toNumber() || 0;
       return {
         categoryId: agg.categoryId,
         name: cat ? cat.name : "Tanpa Kategori",
         icon: cat ? cat.icon : "🏷️",
         color: cat ? cat.color : "#ccc",
         amount,
         percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
       };
    }).sort((a,b) => b.amount - a.amount);
  }

  /**
   * Membandingkan Rencana vs Aktualisasi Pengurangan per kategori (Donut / Progress Chart)
   */
  async getBudgetVsActual(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const budgets = await prisma.budget.findMany({
      where: { userId, month, year, categoryId: { not: null } },
      include: { category: true }
    });

    if (budgets.length === 0) {
      return { month, year, items: [] };
    }

    const expensesGroup = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: "expense",
        transactionDate: { gte: startDate, lte: endDate }
      },
      _sum: { amount: true }
    });

    const items = budgets.map(b => {
      const expenseMatch = expensesGroup.find(e => e.categoryId === b.categoryId);
      const actual = expenseMatch?._sum.amount?.toNumber() || 0;
      const budgetAmount = b.amount.toNumber();

      return {
        categoryId: b.categoryId,
        name: b.category?.name || "Kategori Dihapus",
        icon: b.category?.icon || "❓",
        color: b.category?.color || "#d9d9d9",
        budget: budgetAmount,
        actual,
        difference: budgetAmount - actual,
        percentage: budgetAmount > 0 ? (actual / budgetAmount) * 100 : 0
      };
    });

    return { month, year, items };
  }
}

export const reportService = new ReportService();
