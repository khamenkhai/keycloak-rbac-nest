# Keycloak RBAC with NestJS

This project implements a flexible Role-Based Access Control (RBAC) system using Keycloak and NestJS. It is designed to provide a "Loyverse-like" experience for managing permissions and roles.

## 🏗 RBAC Architecture

The project follows a specific philosophy for managing access:

- **Realm Roles as Project Roles**: Realm-level roles represent broad "Job Titles" or "Personas" within the project (e.g., `Owner`, `Manager`, `Cashier`).
- **Client Roles as Permissions**: Client-level roles represent granular "Permissions" or "Actions" (e.g., `orders:create`, `inventory:view`, `settings:manage`).
- **Permission Assignment**: To grant a permission to a role, you **assign Client Roles into Realm Roles** using Keycloak's composite roles feature.
- **User Assignment**: Users are then assigned to **Realm Roles** to inherit all the associated permissions (Client Roles).

This approach allows for a clean separation between "What someone is" (Realm Role) and "What someone can do" (Client Role).

---

## ⚖️ Why this approach? (Architectural Decision)

You might wonder why we use **Composite Roles** (Realm + Client roles) instead of Keycloak's built-in **Authorization Services** (Resources, Scopes, Policies, and Permissions). Here is the reasoning:

1.  **Reduced Complexity**: Keycloak's formal Authorization Services (Resource-Based Access Control) are powerful but extremely verbose. They require managing complex policy evaluation logic and multiple entities for every single action. Using Client Roles as permissions keeps the logic "flat" and easy to reason about.
2.  **JWT Performance**: In this model, permissions (Client Roles) are encoded directly into the Access Token. The NestJS application can verify access locally without making a secondary back-channel request to Keycloak to evaluate a policy, significantly reducing latency.
3.  **Developer Experience (DX)**: Checking for a specific string like `orders:create` in a guard is much simpler to debug and test than troubleshooting why a "Time-based Policy" or "JavaScript Policy" denied a request in the Keycloak engine.
4.  **UI Syncing**: It is much easier for a Frontend application to hide/show buttons based on a simple list of `roles` in the token than to query the `entitlement` API for every UI element.
5.  **Administrative Clarity**: This mirrors the "Loyverse" model where an admin creates a "Role" and simply checks boxes (Permissions). In Keycloak, this is perfectly represented by dragging Client Roles into a Composite Realm Role.

---

## 🚀 Getting Started

### 1. Environment Setup

Create a `.env` file in the root directory (refer to `example.env`):

````env
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM_NAME=your-realm
KEYCLOAK_CLIENT_ID=admin-cli
KEYCLOAK_CLIENT_SECRET=your-client-secret
KEYCLOAK_GRANT_TYPE=client_credentials
KEYCLOAK_AUTH_REALM=master

# Default Client for Permission Management
KEYCLOAK_DEFAULT_CLIENT_UUID=your-client-uuid

## 🚀 Getting Started

### 1. Environment Setup

Create a `.env` file in the root directory (refer to `example.env`):

```env
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM_NAME=your-realm
KEYCLOAK_CLIENT_ID=admin-cli
KEYCLOAK_CLIENT_SECRET=your-client-secret
KEYCLOAK_GRANT_TYPE=client_credentials
KEYCLOAK_AUTH_REALM=master

# Default Client for Permission Management
KEYCLOAK_DEFAULT_CLIENT_UUID=your-client-uuid
````

### 2. Installation

```bash
$ npm install
```

### 3. Running the App

```bash
# development
$ npm run start:dev
```

## 🛠 Features & API Endpoints

### Users

- `GET /users`: List all users.
- `POST /users`: Create a new user.
- `POST /users/role-mappings/realm`: Assign Realm Roles (Project Roles) to a user.
- `POST /users/role-mappings/clients`: Assign Client Roles (Direct Permissions) to a user.

### Clients & Permissions

- `GET /clients`: List all clients.
- `GET /client-roles`: List all permissions (client roles) for the default client.
- `POST /client-roles`: Create a new permission (client role).

### Role-Permission Management

- `POST /roles/:realmRoleId/permissions`: Assign Client Roles (Permissions) to a Realm Role (Project Role).
- `GET /roles/:realmRoleId/permissions`: Get all permissions associated with a Realm Role.
- `DELETE /roles/:realmRoleId/permissions`: Remove permissions from a Realm Role.

## 🛡 Security Guards

The project includes custom decorators and guards to enforce RBAC:

- `@RealmRoles('Manager')`: Restricts access based on Realm Roles.
- `@ClientRoles('orders:create')`: Restricts access based on Client Roles (Permissions).
- `KeycloakRolesGuard`: Handles the validation of both Realm and Client roles from the JWT token.

## 📜 License

This project is [MIT licensed](LICENSE).
