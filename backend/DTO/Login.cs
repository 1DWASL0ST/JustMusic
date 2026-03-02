namespace backendAPI.DTO
{
    public class Login
    {
        public required string IDUser { get; set; } = string.Empty;
        public required string UserPassword { get; set; } = string.Empty;
    }
}
