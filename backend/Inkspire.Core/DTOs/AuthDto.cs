namespace Inkspire.Core.DTOs;

public record RegisterRequest(
    string Email,
    string UserName,
    string DisplayName,
    string Password
);

public record LoginRequest(
    string Email,
    string Password,
    bool RememberMe = false
);

public record AuthResponse(
    string Token,
    DateTime ExpiresAt,
    UserDto User
);

public record ForgotPasswordRequest(
    string Email
);

public record ResetPasswordRequest(
    string Email,
    string Token,
    string NewPassword
);

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword
);
