import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuarios de prueba
  const users = await prisma.auth.createMany({
    data: [
      {
        email: 'admin@shopflow.com',
        password: 'admin123',
        name: 'Administrador',
        isActive: true
      },
      {
        email: 'user@shopflow.com',
        password: 'user123',
        name: 'Usuario Test',
        isActive: true
      }
    ],
    skipDuplicates: true
  });

  console.log(`✅ ${users.count} usuarios creados exitosamente`);
  
  // Mostrar usuarios creados
  const allUsers = await prisma.auth.findMany();
  console.log('👥 Usuarios en la base de datos:');
  allUsers.forEach(user => {
    console.log(`- ${user.name} (${user.email}) - Activo: ${user.isActive}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Conexión a la base de datos cerrada');
  });
