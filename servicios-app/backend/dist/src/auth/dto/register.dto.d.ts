export declare enum Role {
    CLIENTE = "CLIENTE",
    PROVEEDOR = "PROVEEDOR"
}
export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
    role?: Role;
    phone?: string;
    bio?: string;
    serviceType?: string[];
}
