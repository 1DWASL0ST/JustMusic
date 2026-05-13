namespace backendAPI.Models
{
    public class Admin
    {   
        public required int Id { get; set; }
        public required int UserId {  get; set; }
        public User? user { get; set; } 
    }
}
