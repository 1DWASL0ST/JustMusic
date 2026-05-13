namespace backendAPI.Models
{
    public class Admin
    {
        public required int IDUser {  get; set; }
        public User? user { get; set; } 
    }
}
