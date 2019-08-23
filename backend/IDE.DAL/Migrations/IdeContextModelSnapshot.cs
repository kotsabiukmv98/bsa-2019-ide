﻿// <auto-generated />
using System;
using IDE.DAL.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace IDE.DAL.Migrations
{
    [DbContext(typeof(IdeContext))]
    partial class IdeContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.2.6-servicing-10079")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("IDE.DAL.Entities.Build", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<DateTime?>("BuildFinished");

                    b.Property<string>("BuildMessage");

                    b.Property<DateTime>("BuildStarted");

                    b.Property<int>("BuildStatus");

                    b.Property<int>("ProjectId");

                    b.Property<int?>("UserId");

                    b.HasKey("Id");

                    b.HasIndex("ProjectId");

                    b.HasIndex("UserId");

                    b.ToTable("Builds");
                });

            modelBuilder.Entity("IDE.DAL.Entities.FavouriteProjects", b =>
                {
                    b.Property<int>("ProjectId");

                    b.Property<int>("UserId");

                    b.HasKey("ProjectId", "UserId");

                    b.HasIndex("UserId");

                    b.ToTable("FavouriteProjects");
                });

            modelBuilder.Entity("IDE.DAL.Entities.GitCredential", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Login");

                    b.Property<string>("PasswordHash");

                    b.Property<string>("PasswordSalt");

                    b.Property<int>("Provider");

                    b.Property<string>("Url");

                    b.HasKey("Id");

                    b.ToTable("GitCredentials");
                });

            modelBuilder.Entity("IDE.DAL.Entities.Image", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Url");

                    b.HasKey("Id");

                    b.ToTable("Images");
                });

            modelBuilder.Entity("IDE.DAL.Entities.Project", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("AccessModifier");

                    b.Property<int>("AuthorId");

                    b.Property<string>("Color");

                    b.Property<int>("CompilerType");

                    b.Property<int>("CountOfBuildAttempts");

                    b.Property<int>("CountOfSaveBuilds");

                    b.Property<DateTime>("CreatedAt");

                    b.Property<string>("Description");

                    b.Property<int?>("GitCredentialId");

                    b.Property<int>("Language");

                    b.Property<string>("Name");

                    b.Property<string>("ProjectLink");

                    b.Property<int>("ProjectType");

                    b.HasKey("Id");

                    b.HasIndex("AuthorId");

                    b.HasIndex("GitCredentialId");

                    b.ToTable("Projects");
                });

            modelBuilder.Entity("IDE.DAL.Entities.ProjectMember", b =>
                {
                    b.Property<int>("ProjectId");

                    b.Property<int>("UserId");

                    b.Property<int>("UserAccess");

                    b.HasKey("ProjectId", "UserId");

                    b.HasIndex("UserId");

                    b.ToTable("ProjectMembers");
                });

            modelBuilder.Entity("IDE.DAL.Entities.RefreshToken", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<DateTime>("Expires");

                    b.Property<string>("Token");

                    b.Property<int>("UserId");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("RefreshTokens");
                });

            modelBuilder.Entity("IDE.DAL.Entities.SocialAuthAccount", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("AccountId")
                        .IsRequired();

                    b.Property<int>("Provider");

                    b.Property<int>("UserId");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("SocialAuthAccounts");
                });

            modelBuilder.Entity("IDE.DAL.Entities.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int?>("AvatarId");

                    b.Property<DateTime?>("Birthday");

                    b.Property<string>("Email");

                    b.Property<bool>("EmailConfirmed");

                    b.Property<string>("FirstName");

                    b.Property<string>("GitHubUrl");

                    b.Property<DateTime>("LastActive");

                    b.Property<string>("LastName");

                    b.Property<string>("NickName");

                    b.Property<string>("PasswordHash");

                    b.Property<string>("PasswordSalt");

                    b.Property<DateTime>("RegisteredAt");

                    b.HasKey("Id");

                    b.HasIndex("AvatarId");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("IDE.DAL.Entities.VerificationToken", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Token");

                    b.Property<int>("UserId");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("VerificationTokens");
                });

            modelBuilder.Entity("IDE.DAL.Entities.Build", b =>
                {
                    b.HasOne("IDE.DAL.Entities.Project", "Project")
                        .WithMany("Builds")
                        .HasForeignKey("ProjectId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("IDE.DAL.Entities.User", "User")
                        .WithMany("Builds")
                        .HasForeignKey("UserId");
                });

            modelBuilder.Entity("IDE.DAL.Entities.FavouriteProjects", b =>
                {
                    b.HasOne("IDE.DAL.Entities.Project", "Project")
                        .WithMany("FavouriteProjects")
                        .HasForeignKey("ProjectId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("IDE.DAL.Entities.User", "User")
                        .WithMany("FavouriteProjects")
                        .HasForeignKey("UserId");
                });

            modelBuilder.Entity("IDE.DAL.Entities.Project", b =>
                {
                    b.HasOne("IDE.DAL.Entities.User", "Author")
                        .WithMany("Projects")
                        .HasForeignKey("AuthorId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("IDE.DAL.Entities.GitCredential", "GitCredential")
                        .WithMany()
                        .HasForeignKey("GitCredentialId");
                });

            modelBuilder.Entity("IDE.DAL.Entities.ProjectMember", b =>
                {
                    b.HasOne("IDE.DAL.Entities.Project", "Project")
                        .WithMany("ProjectMembers")
                        .HasForeignKey("ProjectId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("IDE.DAL.Entities.User", "User")
                        .WithMany("ProjectMembers")
                        .HasForeignKey("UserId");
                });

            modelBuilder.Entity("IDE.DAL.Entities.RefreshToken", b =>
                {
                    b.HasOne("IDE.DAL.Entities.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("IDE.DAL.Entities.SocialAuthAccount", b =>
                {
                    b.HasOne("IDE.DAL.Entities.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("IDE.DAL.Entities.User", b =>
                {
                    b.HasOne("IDE.DAL.Entities.Image", "Avatar")
                        .WithMany()
                        .HasForeignKey("AvatarId");
                });

            modelBuilder.Entity("IDE.DAL.Entities.VerificationToken", b =>
                {
                    b.HasOne("IDE.DAL.Entities.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });
#pragma warning restore 612, 618
        }
    }
}
