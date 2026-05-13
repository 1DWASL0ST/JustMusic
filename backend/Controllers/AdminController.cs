using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backendAPI.Data;
using backendAPI.DTO;
using Microsoft.AspNetCore.Authorization;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace backendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly DataDbContext _dbcontext;

        public AdminController(DataDbContext context)
        {
            _dbcontext = context;
        }

        [HttpGet("isAdmin/{userId}")]
        public async Task<IActionResult> IsAdmin(int userId)
        {
            var isAdmin = await _dbcontext.Admins.AnyAsync(a => a.UserId == userId);
            return Ok(new { isAdmin });
        }
        
    }
}
