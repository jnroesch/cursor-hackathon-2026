using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Inkspire.Core.DTOs;
using Inkspire.Core.Entities;
using Inkspire.Core.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Inkspire.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IConfiguration _configuration;

    public AuthService(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var user = new User
        {
            Email = request.Email,
            UserName = request.UserName,
            DisplayName = request.DisplayName,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to create user: {errors}");
        }

        return await GenerateAuthResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);

        if (!result.Succeeded)
        {
            if (result.IsLockedOut)
            {
                throw new UnauthorizedAccessException("Account is locked. Please try again later.");
            }
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        return await GenerateAuthResponse(user);
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            // Don't reveal that the user doesn't exist
            return;
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        
        // TODO: Send email with reset token
        // For MVP, we'll just log it
        Console.WriteLine($"Password reset token for {request.Email}: {token}");
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            throw new InvalidOperationException("Invalid request");
        }

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to reset password: {errors}");
        }
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to change password: {errors}");
        }
    }

    public async Task<UserDto> GetCurrentUserAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        return new UserDto(
            user.Id,
            user.Email ?? "",
            user.UserName ?? "",
            user.DisplayName,
            user.AvatarUrl,
            user.CreatedAt
        );
    }

    private async Task<AuthResponse> GenerateAuthResponse(User user)
    {
        var token = GenerateJwtToken(user);
        var expirationDays = int.Parse(_configuration["Jwt:ExpirationInDays"] ?? "7");
        var expiresAt = DateTime.UtcNow.AddDays(expirationDays);

        var userDto = new UserDto(
            user.Id,
            user.Email ?? "",
            user.UserName ?? "",
            user.DisplayName,
            user.AvatarUrl,
            user.CreatedAt
        );

        return new AuthResponse(token, expiresAt, userDto);
    }

    private string GenerateJwtToken(User user)
    {
        var secret = _configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
        var issuer = _configuration["Jwt:Issuer"] ?? "Inkspire";
        var audience = _configuration["Jwt:Audience"] ?? "Inkspire";
        var expirationDays = int.Parse(_configuration["Jwt:ExpirationInDays"] ?? "7");

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email ?? ""),
            new(ClaimTypes.Name, user.UserName ?? ""),
            new("display_name", user.DisplayName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(expirationDays),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
