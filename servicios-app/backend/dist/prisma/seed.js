"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Iniciando seed de base de datos...');
    const adminHash = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@servicios.com' },
        update: {},
        create: {
            email: 'admin@servicios.com',
            password: adminHash,
            name: 'Administrador',
            role: client_1.Role.ADMIN,
        },
    });
    const clientHash = await bcrypt.hash('cliente123', 10);
    await prisma.user.upsert({
        where: { email: 'cliente@demo.com' },
        update: {},
        create: {
            email: 'cliente@demo.com',
            password: clientHash,
            name: 'Carlos López',
            role: client_1.Role.CLIENTE,
            phone: '5551234567',
        },
    });
    const providerHash = await bcrypt.hash('proveedor123', 10);
    const providerUser = await prisma.user.upsert({
        where: { email: 'proveedor@demo.com' },
        update: {},
        create: {
            email: 'proveedor@demo.com',
            password: providerHash,
            name: 'Juan Martínez',
            role: client_1.Role.PROVEEDOR,
            phone: '5557654321',
        },
    });
    const existingProvider = await prisma.provider.findUnique({
        where: { userId: providerUser.id },
    });
    if (!existingProvider) {
        await prisma.provider.create({
            data: {
                userId: providerUser.id,
                bio: 'Técnico especializado con más de 8 años de experiencia en servicios del hogar.',
                serviceType: ['Plomería', 'Electricidad'],
                isAvailable: true,
                lat: 19.4326,
                lng: -99.1332,
                rating: 4.8,
            },
        });
    }
    const servicios = [
        {
            name: 'Plomería',
            description: 'Reparación e instalación de tuberías, llaves y sistemas hidráulicos.',
            category: 'Hogar',
            basePrice: 500,
        },
        {
            name: 'Electricidad',
            description: 'Instalaciones eléctricas, reparaciones y mantenimiento preventivo.',
            category: 'Hogar',
            basePrice: 600,
        },
        {
            name: 'Limpieza',
            description: 'Limpieza profunda de hogar, oficinas y espacios comerciales.',
            category: 'Hogar',
            basePrice: 400,
        },
        {
            name: 'Jardinería',
            description: 'Diseño, mantenimiento y poda de jardines y áreas verdes.',
            category: 'Jardín',
            basePrice: 350,
        },
        {
            name: 'Pintura',
            description: 'Pintura de interiores y exteriores con acabados profesionales.',
            category: 'Hogar',
            basePrice: 700,
        },
        {
            name: 'Carpintería',
            description: 'Fabricación y reparación de muebles y estructuras de madera.',
            category: 'Hogar',
            basePrice: 650,
        },
        {
            name: 'Cerrajería',
            description: 'Apertura, instalación y cambio de cerraduras.',
            category: 'Seguridad',
            basePrice: 300,
        },
        {
            name: 'Aire Acondicionado',
            description: 'Instalación, mantenimiento y reparación de equipos de climatización.',
            category: 'Hogar',
            basePrice: 800,
        },
    ];
    for (const servicio of servicios) {
        await prisma.service.upsert({
            where: { name: servicio.name },
            update: {},
            create: servicio,
        });
    }
    console.log('✅ Seed completado exitosamente!');
    console.log('');
    console.log('Credenciales de acceso:');
    console.log('  Admin:     admin@servicios.com     / admin123');
    console.log('  Cliente:   cliente@demo.com        / cliente123');
    console.log('  Proveedor: proveedor@demo.com      / proveedor123');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map