using backendAPI.Data;
using backendAPI.DTO;
using Microsoft.AspNetCore.Mvc;
using BC = BCrypt.Net.BCrypt;
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
        public async Task<ActionResult<IEnumerable<UserResponse>>> Get()
        {
            try
            {
                List<UserResponse> users = await _dbContext.Users
                    .Select(user => new UserResponse  
                    {
                        IDUser = user.IDUser,
                        UserName = user.UserName
                    })
                    .ToListAsync();

                _logger.LogInformation("Получен список пользователей");

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка пользователей");
                return StatusCode(500, new { message = "Не удалось получить список пользователей" });
            }
        }

        // GET api/<UserController>/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponse>> Get(int id)
        {
            try
            {
                UserResponse user = await _dbContext.Users
                    .Where(user => user.IDUser == id)
                    .Select(response => new UserResponse
                    {
                        IDUser = response.IDUser,
                        UserName = response.UserName
                    })
                    .FirstOrDefaultAsync();
                if (user == null)
                {
                    _logger.LogWarning("Пользователь {id} не найден", id);
                    return NotFound(new { message = "Пользователь не найден" });
                }

                _logger.LogInformation("Пользователь найден");

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при нахождении пользователя");
                return StatusCode(500, new { message = "Не удалось выполнить получение пользователя" });
            }
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
                    UserPassword = BC.HashPassword(register.UserPassword)
                };

                _dbContext.Users.Add(user);
                await _dbContext.SaveChangesAsync();
                
                Playlist playlist = new Playlist
                {
                    PlaylistName = "Избранное",
                    IDUser = user.IDUser
                };

                _dbContext.Playlists.Add(playlist);
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

                bool PasswordCheck = BC.Verify(login.UserPassword, user.UserPassword);

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
        [HttpPut("ChangeUserName{id}")]
        public async Task<IActionResult> ChangeUserName(int id, [FromBody] ChangeUsername request)
        {
            try
            {
                User user = await _dbContext.Users.FindAsync(id);

                if(user == null)
                {
                    _logger.LogWarning("Пользователь {id} не найден", id);
                    return NotFound(new { mesage = "Пользователь не найден" });
                }

                if (string.IsNullOrEmpty(request.NewUserName))
                {
                    _logger.LogWarning("Невозможно добавить пустое имя пользователя");
                    return BadRequest(new { mesage = "Имя пользователя не может быть пустым" });
                }

                user.UserName = request.NewUserName;
                await _dbContext.SaveChangesAsync();
                
                 _logger.LogInformation("Успешное изменение имени пользователя");
                return Ok(new { mesage = "Имя пользователя обновлено" });
            }

            catch(Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении имени пользователя");
                return StatusCode(500, new { message = "Не удалось обновить имя пользователя" });
            }
        }

        [HttpPut("ChangePassword{id}")]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePassword request)
        {
            try
            {
                User user = await _dbContext.Users.FindAsync(id);
                if (user == null)
                {
                    _logger.LogWarning("Пользователь {id} не найден", id);
                    return NotFound(new { mesage = "Пользователь не найден" });
                }

                bool checkPassword = BC.Verify(request.CurrentPassword, user.UserPassword);

                if (!checkPassword)
                {
                    _logger.LogWarning("Неверное введение текущего пароля");
                    return BadRequest(new { mesage = "Неверно введён текущий пароль" });
                }

                if (string.IsNullOrEmpty(request.NewPassword))
                {
                    _logger.LogWarning("Невозможно добавить пустой пароль");
                    return BadRequest(new { mesage = "Пароль не может быть пустым" });
                }

                user.UserPassword = BC.HashPassword(request.NewPassword);
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("Успешное изменение пароля");
                return Ok(new { mesage = "Пароль обновлен" });
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении пароля");
                return StatusCode(500, new { message = "Не удалось обновить имя пользователя" });
            }
        }

        // DELETE api/<UserController>/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                User user = await _dbContext.Users
                    .FirstOrDefaultAsync(user => user.IDUser == id);

                if (user == null) 
                {
                    _logger.LogWarning("Удаляемый пользователь {id} не найден", id);
                    return NotFound(new { message = "Пользователь не найден" });
                }

                _dbContext.Remove(user);
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("Пользователь {Id} и все его плейлисты удалены", id);

                return Ok(new { message = "Удаление прошло успешно" });

            }

            catch(Exception ex)
            {
                _logger.LogError(ex, "Ошибка удаления");
                return StatusCode(500, new { message = "При удалении произошла ошибка" });
            }
        }
    }
}
