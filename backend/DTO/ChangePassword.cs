namespace backendAPI.DTO
{
    public class ChangePassword
    {
        public required string CurrentPassword { get; set; }
        public required string NewPassword { get; set; }
    }
}
