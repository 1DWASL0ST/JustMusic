using backendAPI.Data;
using backendAPI.DTO;
using Microsoft.AspNetCore.Mvc;
using BC = BCrypt.Net.BCrypt;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace backendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ILogger<TrackController> _logger;
        private readonly DataDbContext _dbContext;
        private readonly ITokenService _tokenService;
        public UserController(DataDbContext dbContext, ILogger<TrackController> logger, ITokenService tokenService)
        {
            _logger = logger;
            _dbContext = dbContext;
            _tokenService = tokenService;
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
                if(string.IsNullOrEmpty(register.UserName) || string.IsNullOrEmpty(register.UserPassword))
                {
                    return BadRequest(new { message = "Нельзя регистрировать пользователя без пароля или имени пользователя" });
                }

                User exsistingUser = await _dbContext.Users
                    .FirstOrDefaultAsync(exsistingUser => exsistingUser.UserName == register.UserName);

                if (exsistingUser != null) 
                {
                    return BadRequest(new { message = "Имя пользвателя занято" });
                }

                if (register.RepeatPassword == register.UserPassword)
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
                else
                {
                    _logger.LogError("Ошибка при регистрации");
                    return BadRequest(new { message = "Пароли не совпадают" });
                }
                
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
                    .FirstOrDefaultAsync(user => user.UserName == login.UserName);

                if(user == null)
                {
                    _logger.LogWarning("Неверное имя пользователя: {UserName}!", login.UserName);
                    return Unauthorized(new { message = "Неверный логин или пароль" });
                }

                bool PasswordCheck = BC.Verify(login.UserPassword, user.UserPassword);

                if (!PasswordCheck)
                {
                    _logger.LogWarning("Неверный пароль!", login.UserName);
                    return Unauthorized(new { message = "Неверный логин или пароль" });
                }
                _logger.LogInformation("Пользователь {UserName} вошел", user.UserName);

                string accessToken = _tokenService.GenerateAccessToken(user);
                string refreshToken = _tokenService.GenerateRefreshToken();

                RefreshToken rt = new RefreshToken
                {
                    Token = refreshToken,
                    IDUser = user.IDUser,
                    ExpiryDate = DateTime.UtcNow.AddDays(30),
                    CreatedAt = DateTime.UtcNow,
                    IsRevoked = false
                };

                _dbContext.RefreshTokens.Add(rt);
                await _dbContext.SaveChangesAsync();

                UserResponse response = new UserResponse
                {
                    IDUser = user.IDUser,
                    UserName = user.UserName
                };
                return Ok(new {accessToken, refreshToken, expiresIn = 900, response, message = "Вход выполнен успешко!" }); ;
            }

            catch(Exception ex) 
            {
                _logger.LogError(ex, "Ошибка входа");
                return StatusCode(500, new { message = "При входе произошла ошибка" });
            }
        }

        [HttpPost("RefreshToken")]
        public async Task<ActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var principal = _tokenService.GetPrincipalFromExpiredToken(request.AccessToken);
            var idUser = int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var refreshToken = await _dbContext.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken && rt.IDUser == idUser);

            if (refreshToken == null || refreshToken.ExpiryDate < DateTime.UtcNow || refreshToken.IsRevoked)
            {
                return Unauthorized(new { message = "Invalid refresh token" });
            }

            var newAccessToken = _tokenService.GenerateAccessToken(refreshToken.User);
            var newRefreshToken = _tokenService.GenerateRefreshToken();

            refreshToken.IsRevoked = true;

            _dbContext.RefreshTokens.Add(new RefreshToken
            {
                Token = newRefreshToken,
                IDUser = idUser,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow,
                IsRevoked = false
            });

            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                accessToken = newAccessToken,
                refreshToken = newRefreshToken,
                expiresIn = 900
            });
        }

        // PUT api/<UserController>/5
        [Authorize]
        [HttpPut("ChangeUserName/{id}")]
        public async Task<IActionResult> ChangeUserName(int id, [FromBody] ChangeUsername request)
        {
            try
            {
                User user = await _dbContext.Users.FindAsync(id);

                if(user == null)
                {
                    _logger.LogWarning("Пользователь {id} не найден", id);
                    return NotFound(new { message = "Пользователь не найден" });
                }

                if (string.IsNullOrEmpty(request.NewUserName))
                {
                    _logger.LogWarning("Невозможно добавить пустое имя пользователя");
                    return BadRequest(new { message = "Имя пользователя не может быть пустым" });
                }

                User checkUserName = await _dbContext.Users.FirstOrDefaultAsync(user => user.UserName == request.NewUserName && user.IDUser != id);

                if(checkUserName != null)
                {
                    _logger.LogWarning("Невозможно добавить занятое имя пользователя");
                    return BadRequest(new { message = "Имя пользователя занято" });
                }

                user.UserName = request.NewUserName;
                await _dbContext.SaveChangesAsync();
                
                 _logger.LogInformation("Успешное изменение имени пользователя");
                return Ok(new { message = "Имя пользователя обновлено" });
            }

            catch(Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении имени пользователя");
                return StatusCode(500, new { message = "Не удалось обновить имя пользователя" });
            }
        }

        [Authorize]
        [HttpPut("ChangePassword/{id}")]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePassword request)
        {
            try
            {
                User user = await _dbContext.Users.FindAsync(id);
                if (user == null)
                {
                    _logger.LogWarning("Пользователь {id} не найден", id);
                    return NotFound(new { message = "Пользователь не найден" });
                }

                bool checkPassword = BC.Verify(request.CurrentPassword, user.UserPassword);

                if (!checkPassword)
                {
                    _logger.LogWarning("Неверное введение текущего пароля");
                    return BadRequest(new { message = "Неверно введён текущий пароль" });
                }

                if (string.IsNullOrEmpty(request.NewPassword))
                {
                    _logger.LogWarning("Невозможно добавить пустой пароль");
                    return BadRequest(new { message = "Пароль не может быть пустым" });
                }

                user.UserPassword = BC.HashPassword(request.NewPassword);
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("Успешное изменение пароля");
                return Ok(new { message = "Пароль обновлен" });
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении пароля");
                return StatusCode(500, new { message = "Не удалось обновить имя пользователя" });
            }
        }

        // DELETE api/<UserController>/5
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var isAdmin = await _dbContext.Admins.AnyAsync(a => a.IDUser == currentUserId);
                if (!isAdmin || currentUserId != id)
                {
                    return Unauthorized("Недостаточно прав");
                }
                else
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

                    _logger.LogInformation("Пользователь {id} и все его плейлисты удалены", id);

                    return Ok(new { message = "Удаление прошло успешно" });
                }
            }

            catch(Exception ex)
            {
                _logger.LogError(ex, "Ошибка удаления");
                return StatusCode(500, new { message = "При удалении произошла ошибка" });
            }
        }
    }
}
