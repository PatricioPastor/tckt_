import prisma from '../lib/prisma'

async function fixReferralCodes() {
  try {
    console.log('🔧 Actualizando códigos de referido a mayúsculas...\n')

    // Actualizar Magali
    const magali = await prisma.producerMember.update({
      where: { id: 2 },
      data: { referralCode: 'MAGALI2025' },
      include: {
        user: {
          select: { name: true }
        }
      }
    })

    console.log(`✅ ${magali.user.name}: ${magali.referralCode}`)

    // Actualizar Victoria
    const victoria = await prisma.producerMember.update({
      where: { id: 3 },
      data: { referralCode: 'VICTORIA2025' },
      include: {
        user: {
          select: { name: true }
        }
      }
    })

    console.log(`✅ ${victoria.user.name}: ${victoria.referralCode}`)

    console.log('\n🎉 Códigos actualizados exitosamente!')

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixReferralCodes()
