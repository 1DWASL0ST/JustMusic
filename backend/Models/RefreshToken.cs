public class RefreshToken
{
    public int ID { get; set; }
    public required string Token { get; set; }
    public required int IDUser { get; set; }
    public required DateTime ExpiryDate { get; set; }
    public required bool IsRevoked { get; set; }
    public required DateTime CreatedAt { get; set; }

    public User User { get; set; } = null!;
}