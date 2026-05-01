import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Movie Tracker API",
            version: "1.0.0",
            description: "REST API for Movie Tracker",
        },

        servers: [{url: "http://localhost:4000/api"}],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
          schemas: {

            Movie: {
              type: "object",
              properties: {
                _id: {type: "string"},
                title: {type: "string", example: "Inception"},
                year: {type: "number", example: 2010},
                genres: {
                  type: "array",
                  items: {type: "string"},
                  example: ["Sci-Fi", "Thriller"]
                },
                posterUrl: {
                  type: "string",
                  example: "https://image.tmdb.org/..."
                },
                createdAt: {type: "string", format: "date-time"},
                updatedAt: {type: "string", format: "date-time"}
              }
            },
            MovieCreate: {
              type: "object",
              required: ["title"],
              properties: {
                title: {type: "string", example: "Inception"},
                year: {type: "number", example: 2010},
                genres: {type: "array", items: {type: "string"}, example: ["Sci-Fi"]},
                posterUrl: {type: "string", example: "https://image.tmdb.org/..."},
              },
            },

            MovieUpdate: {
              type: "object",
              properties: {
                title: {type: "string", example: "Inception"},
                year: {type: "number", example: 2010},
                genres: {type: "array", items: {type: "string"}, example: ["Sci-Fi"]},
                posterUrl: {type: "string", example: "https://image.tmdb.org/..."},
              },
            },

            User: {
              type: "object",
              properties: {
                _id: {type: "string"},
                email: {type: "string", example: "john@email.com"},
                username: {type: "string", example: "john_doe"},
                role: {
                  type: "string",
                  enum: ["user", "admin"]
                },
                createdAt: {type: "string", format: "date-time"},
                updatedAt: {type: "string", format: "date-time"}
              }
            },

            UserMovie: {
              type: "object",
              properties: {
                _id: {type: "string"},

                userId: {
                  type: "string",
                  description: "User ObjectId"
                },

                movieId: {
                  $ref: "#/components/schemas/Movie"
                },

                status: {
                  type: "string",
                  enum: ["planned", "watching", "watched"]
                },

                watchedAt: {
                  type: "string",
                  format: "date-time"
                },

                rating: {
                  type: "number",
                  minimum: 1,
                  maximum: 10
                },

                review: {
                  type: "string",
                  maxLength: 2000
                },

                createdAt: {type: "string", format: "date-time"},
                updatedAt: {type: "string", format: "date-time"}
              }
            },

            RegisterRequest: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: {type: "string", example: "john@email.com"},
                password: {type: "string", example: "password123"},
                username: {type: "string", example: "john_doe"}
              }
            },

            LoginRequest: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: {type: "string"},
                password: {type: "string"}
              }
            },


            AuthResponse: {
              type: "object",
              properties: {
                token: {type: "string"}
              }
            },
            UserMovieCreateRequest: {
              type: "object",
              required: ["movieId"],
              properties: {
                movieId: { type: "string", description: "Movie ObjectId" },
                status: { type: "string", enum: ["planned", "watching", "watched"] }
              }
            },

            UserMovieUpdateRequest: {
              type: "object",
              properties: {
                status: { type: "string", enum: ["planned", "watching", "watched"] },
                watchedAt: { type: "string", format: "date-time" },
                rating: { type: "number", minimum: 1, maximum: 10 },
                review: { type: "string", maxLength: 2000 }
              }
            },

          }

        }
    },

  apis: ["src/routes/**/*.ts"]
});