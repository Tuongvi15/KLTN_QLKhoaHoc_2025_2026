using LMSystem.Repository.Data;
using LMSystem.Repository.Helpers;
using LMSystem.Repository.Models;
using LMSystem.Repository.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Interfaces
{
    public interface IOrderRepository
    {
        public Task<IEnumerable<Order>> GetOrdersByAccountIdAsync(string accountId);
        public Task<ResponeModel> CountTotalOrder();
        Task<List<TeacherRevenueReportDto>> GetTeacherRevenueReport(string? teacherId, DateTime? fromDate, DateTime? toDate);
        public Task<ResponeModel> CountTotalOrdersByStatus(string status);
        public Task<ResponeModel> CountTotalOrdersByStatusUpToDate(string status, DateTime to);
        public Task<ResponeModel> CountOrderByStatusGroupByMonth(string status, int year);
        Task<List<TeacherCourseReportDto>> GetTeacherCoursesReport(
    string teacherId, string? search, DateTime? fromDate, DateTime? toDate);
        Task<List<CourseRevenueDetailDto>> GetCourseRevenueDetail(
     string? teacherId,
     int? month,
     int? year);
        public Task<ResponeModel> GetYearList();
        public Task<ResponeModel> CountTotalIncome();
        public Task<ResponeModel> CountTotalIncomeUpToDate(DateTime to);
        public Task<ResponeModel> CountTotalIncomeByMonth(int year);
        public Task<PagedList<Order>> GetOrderWithFilter(PaginationParameter paginationParameter, OrderFilterParameter orderFilterParameter);
        #region  payment
        Task<ResponeModel> AddCourseToPayment(AddOrderPaymentModel addOrderPaymentModel);
        Task<ResponeModel> GetOrderSuccessByAccountIdAndCourseId(string accountId, int courseId);
        Task<ResponeModel> GetOrderPendingByAccountIdAndCourseId(string accountId, int courseId);
        Task<ResponeModel> GetOrderByTransactionId(string transactionId);
        Task<Order> GetOrdersByIdAsync(int ID);
        Task<bool> UpdateOrderStatus(string orderCode, string status);
        Task<bool> UpdateOrder(Order order);
        #endregion
    }
}
