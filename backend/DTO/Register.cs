namespace backendAPI.DTO
{
    public class Register
    {
        public required string UserName { get; set; }
        public required string UserPassword { get; set; }
        public required string RepeatPassword { get; set; }

    }
}
