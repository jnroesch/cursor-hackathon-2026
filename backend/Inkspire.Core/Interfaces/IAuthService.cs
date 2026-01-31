using Inkspire.Core.DTOs;

namespace Inkspire.Core.Interfaces;

/// <summary>
/// Service for handling user authentication operations.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Registers a new user account.
    /// </summary>
    Task<AuthResponse> RegisterAsync(RegisterRequest request);

    /// <summary>
    /// Authenticates a user and returns a JWT token.
    /// </summary>
    Task<AuthResponse> LoginAsync(LoginRequest request);

    /// <summary>
    /// Initiates the password reset process by sending an email.
    /// </summary>
    Task ForgotPasswordAsync(ForgotPasswordRequest request);

    /// <summary>
    /// Completes the password reset using the token from email.
    /// </summary>
    Task ResetPasswordAsync(ResetPasswordRequest request);

    /// <summary>
    /// Changes the password for a logged-in user.
    /// </summary>
    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request);

    /// <summary>
    /// Gets the current user's profile.
    /// </summary>
    Task<UserDto> GetCurrentUserAsync(Guid userId);

    /// <summary>
    /// Updates the current user's profile.
    /// </summary>
    Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
}
