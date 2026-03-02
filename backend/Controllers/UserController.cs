using backendAPI.Data;
using backendAPI.DTO;
using Microsoft.AspNetCore.Mvc;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace backendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ILogger<TrackController> _logger;
        private readonly DataDbContext _dbContext;
        public UserController(DataDbContext dbContext, ILogger<TrackController> logger)
        {
            _logger = logger;
            _dbContext = dbContext;
        }
        // GET: api/<UserController>
        [HttpGet]
        public IEnumerable<User> Get()
        {
            return null;
        }

        // GET api/<UserController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // Register api/<UserController>
        [HttpPost("Register")]
        public async Task<ActionResult<UserResponse>> Register([FromBody] Register register)
        {
            try
            {
                User user = new User
                {
                    UserName = register.UserName,
                    UserPassword = BCrypt.Net.BCrypt.HashPassword(register.UserPassword)
                };

                _dbContext.Users.Add(user);
                await _dbContext.SaveChangesAsync();

                UserResponse response = new UserResponse
                {
                    IDUser = user.IDUser,
                    UserName = user.UserName
                };

                return CreatedAtAction(nameof(Register), new { id = user.IDUser }, response);
            }
            catch (Exception ex) 
            {
                _logger.LogError(ex, "Ошибка при регистрации");
                return StatusCode(500, $"Не удалось зарегистрировать пользователя");
            }
        }

        // Login api/<UserController>
        [HttpPost("Login")]

        public async Task<ActionResult<UserResponse>> Login([FromBody] Login login)
        {
            try
            {
                User user = await _dbContext.Users
                    .FirstOrDefaultAsync(user => user.IDUser == login.IDUser);

                if(user == null)
                {
                    _logger.LogWarning("Неверный ID: {IDUser}!", login.IDUser);
                    return Unauthorized(new { message = "Неверный логин или пароль" });
                }

                bool PasswordCheck = BCrypt.Net.BCrypt.Verify(login.UserPassword, user.UserPassword);

                if (!PasswordCheck)
                {
                    _logger.LogWarning("Неверный пароль для пользователя {IDUser}!", login.IDUser);
                    return Unauthorized(new { message = "Неверный логин или пароль" });
                }
                _logger.LogInformation("Пользователь {UserName} вошел", user.UserName);

                UserResponse response = new UserResponse
                {
                    IDUser = user.IDUser,
                    UserName = user.UserName
                };
                return Ok(new { message = "Добро пожаловать. Здесь только музыка", response }); ;
            }

            catch(Exception ex) 
            {
                _logger.LogError(ex, "Ошибка входа");
                return StatusCode(500, new { message = "При входе произошла ошибка" });
            }
        }
       
        // PUT api/<UserController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<UserController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
