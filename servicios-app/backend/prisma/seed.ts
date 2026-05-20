import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PASS = 'Harambal2025!';

async function main() {
  console.log('🌱 Iniciando seed de base de datos...\n');

  // ── Servicios del catálogo ────────────────────────────────────────────────
  const servicios = [
    { name: 'Plomería',           description: 'Reparación e instalación de tuberías, llaves y sistemas hidráulicos.', category: 'Hogar',     basePrice: 500 },
    { name: 'Electricidad',       description: 'Instalaciones eléctricas, reparaciones y mantenimiento preventivo.',   category: 'Hogar',     basePrice: 600 },
    { name: 'Limpieza',           description: 'Limpieza profunda de hogar, oficinas y espacios comerciales.',         category: 'Hogar',     basePrice: 400 },
    { name: 'Jardinería',         description: 'Diseño, mantenimiento y poda de jardines y áreas verdes.',             category: 'Jardín',    basePrice: 350 },
    { name: 'Pintura',            description: 'Pintura de interiores y exteriores con acabados profesionales.',       category: 'Hogar',     basePrice: 700 },
    { name: 'Carpintería',        description: 'Fabricación y reparación de muebles y estructuras de madera.',         category: 'Hogar',     basePrice: 650 },
    { name: 'Cerrajería',         description: 'Apertura, instalación y cambio de cerraduras.',                        category: 'Seguridad', basePrice: 300 },
    { name: 'Aire Acondicionado', description: 'Instalación, mantenimiento y reparación de equipos de climatización.', category: 'Hogar',     basePrice: 800 },
  ];

  for (const s of servicios) {
    await prisma.service.upsert({ where: { name: s.name }, update: {}, create: s });
  }
  console.log('✅ Servicios creados');

  // ── Admin Gmail ───────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash(PASS, 10);
  await prisma.user.upsert({
    where:  { email: 'admin.harambal@gmail.com' },
    update: {},
    create: {
      email:    'admin.harambal@gmail.com',
      password: adminHash,
      name:     'Administrador Harambal',
      role:     Role.ADMIN,
      phone:    '9512000000',
    },
  });
  console.log('✅ Admin creado: admin.harambal@gmail.com');

  // ── 5 Clientes Gmail ──────────────────────────────────────────────────────
  const clientes = [
    { email: 'sofia.ramirez92@gmail.com',  name: 'Sofía Ramírez',    phone: '9511100001' },
    { email: 'carlos.mendoza@gmail.com',   name: 'Carlos Mendoza',   phone: '9511100002' },
    { email: 'luciana.torres@gmail.com',   name: 'Luciana Torres',   phone: '9511100003' },
    { email: 'miguel.hernandez@gmail.com', name: 'Miguel Hernández', phone: '9511100004' },
    { email: 'valentina.cruz@gmail.com',   name: 'Valentina Cruz',   phone: '9511100005' },
  ];

  const clienteHash = await bcrypt.hash(PASS, 10);
  for (const c of clientes) {
    await prisma.user.upsert({
      where:  { email: c.email },
      update: {},
      create: { email: c.email, password: clienteHash, name: c.name, role: Role.CLIENTE, phone: c.phone },
    });
  }
  console.log('✅ 5 Clientes creados');

  // ── 5 Proveedores Gmail ───────────────────────────────────────────────────
  const proveedores = [
    {
      email: 'juan.plomero.oax@gmail.com',   name: 'Juan Pérez Gómez',
      phone: '9512200001', bio: 'Plomero certificado con 10 años de experiencia en Oaxaca.',
      serviceType: ['Plomería'], lat: 17.0732, lng: -96.7266, rating: 4.8,
    },
    {
      email: 'mario.electrico@gmail.com',    name: 'Mario García Ruiz',
      phone: '9512200002', bio: 'Electricista industrial con licencia CFE, trabajos de alta y baja tensión.',
      serviceType: ['Electricidad'], lat: 17.0751, lng: -96.7240, rating: 4.6,
    },
    {
      email: 'ana.limpieza.pro@gmail.com',   name: 'Ana López Reyes',
      phone: '9512200003', bio: 'Especialista en limpieza profunda residencial y comercial. Productos ecológicos.',
      serviceType: ['Limpieza'], lat: 17.0710, lng: -96.7290, rating: 4.9,
    },
    {
      email: 'roberto.pintor@gmail.com',     name: 'Roberto Sánchez',
      phone: '9512200004', bio: 'Pintor con más de 15 años. Interiores, exteriores y acabados decorativos.',
      serviceType: ['Pintura', 'Carpintería'], lat: 17.0695, lng: -96.7310, rating: 4.7,
    },
    {
      email: 'fernanda.jardineria@gmail.com', name: 'Fernanda Vásquez',
      phone: '9512200005', bio: 'Diseñadora de jardines y experta en plantas nativas de Oaxaca.',
      serviceType: ['Jardinería'], lat: 17.0780, lng: -96.7200, rating: 4.5,
    },
  ];

  const proveedorHash = await bcrypt.hash(PASS, 10);
  for (const p of proveedores) {
    const user = await prisma.user.upsert({
      where:  { email: p.email },
      update: {},
      create: {
        email:    p.email,
        password: proveedorHash,
        name:     p.name,
        role:     Role.PROVEEDOR,
        phone:    p.phone,
      },
    });

    const existing = await prisma.provider.findUnique({ where: { userId: user.id } });
    if (!existing) {
      await prisma.provider.create({
        data: {
          userId:      user.id,
          bio:         p.bio,
          serviceType: p.serviceType,
          isAvailable: true,
          lat:         p.lat,
          lng:         p.lng,
          rating:      p.rating,
        },
      });
    }
  }
  console.log('✅ 5 Proveedores creados');

  // ── Resumen ───────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════');
  console.log('  CREDENCIALES — contraseña: Harambal2025!');
  console.log('════════════════════════════════════════');
  console.log('\n👑 ADMIN');
  console.log('  admin.harambal@gmail.com');
  console.log('\n🛍️  CLIENTES');
  clientes.forEach(c => console.log(`  ${c.email}`));
  console.log('\n🔧 PROVEEDORES');
  proveedores.forEach(p => console.log(`  ${p.email}  (${p.serviceType.join(', ')})`));
  console.log('\n════════════════════════════════════════\n');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
