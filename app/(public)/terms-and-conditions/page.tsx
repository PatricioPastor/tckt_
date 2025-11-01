import Link from 'next/link';

const sectionClass = 'space-y-3';

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-dvh bg-background px-6 py-16 text-foreground sm:px-12">
      <article className="mx-auto w-full max-w-3xl space-y-8">
        <header className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Legal</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Términos y Condiciones de Uso</h1>
          <p className="text-sm text-muted-foreground">Última actualización: 20/08/2025 13:21</p>
        </header>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold">1. Aceptación de los Términos y Condiciones</h2>
          <p>
            El presente documento establece los Términos y Condiciones de Uso (en adelante, los “Términos”) aplicables al
            acceso, navegación y utilización de la plataforma digital de venta de entradas (en adelante, la “Plataforma” o la
            “Aplicación”), desarrollada y administrada por sus titulares (en adelante, los “Titulares”), conforme a las
            disposiciones del Código Civil y Comercial de la Nación Argentina, la Ley N.º 24.240 de Defensa del Consumidor,
            la Ley N.º 25.326 de Protección de Datos Personales y demás normativa vigente.
          </p>
          <p>
            El acceso y utilización de la Plataforma por parte de cualquier persona (en adelante, el “Usuario”) implica la
            aceptación plena y sin reservas de todos los términos, condiciones y políticas aquí establecidas. En caso de no
            estar de acuerdo, el Usuario deberá abstenerse de utilizar la Plataforma.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold">2. Titularidad y responsabilidad operativa</h2>
          <p>
            La Plataforma es propiedad y se encuentra bajo la responsabilidad de Patricio Pastor, titular inscripto ante la
            Agencia de Recaudación y Control Aduanero (ARCA) y único titular de la cuenta de Mercado Pago vinculada al sistema
            de cobros (en adelante, el “Responsable Fiscal”).
          </p>
          <p>
            El Responsable Fiscal actúa como intermediario tecnológico entre los Usuarios compradores y los organizadores o
            productores de los eventos (en adelante, los “Organizadores”). En ningún caso se lo considerará responsable por la
            organización, contenido, suspensión o modificación de los eventos publicados.
          </p>
          <p>
            El segundo desarrollador y/o colaborador del proyecto, no inscripto ante AFIP, carece de toda responsabilidad
            legal, fiscal o contractual frente a terceros, limitándose su participación al desarrollo técnico y soporte
            informático de la Plataforma.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold">3. Objeto de la Plataforma</h2>
          <p>
            La Plataforma tiene por objeto facilitar el acceso a la compra electrónica de entradas o tickets digitales para
            eventos, gestionando los procesos de cobro, emisión y distribución electrónica mediante integraciones con sistemas
            de pago de terceros, particularmente Mercado Pago Checkout Pro.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold">4. Procesamiento de pagos y fondos</h2>
          <p>
            Los pagos efectuados por los Usuarios se procesan exclusivamente a través de Mercado Pago, conforme a los Términos
            y Condiciones de dicha entidad. El Responsable Fiscal no almacena, procesa ni accede a información financiera
            sensible de los Usuarios.
          </p>
          <p>
            Los fondos derivados de la venta de entradas son acreditados en la cuenta de Mercado Pago titularidad del
            Responsable Fiscal, quien será el único sujeto registrado ante ARCA como receptor de ingresos y responsable de las
            obligaciones tributarias que pudieran corresponder.
          </p>
          <p>
            El Responsable Fiscal podrá retener, suspender o anular operaciones en caso de detectar conductas irregulares,
            fraudulentas o que vulneren las normas aplicables.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold">5. Limitación de responsabilidad</h2>
          <p>La Plataforma actúa como medio tecnológico de intermediación. En consecuencia:</p>
          <ul className="list-disc space-y-2 pl-6 text-sm leading-relaxed text-muted-foreground">
            <li>Los Organizadores son los únicos responsables por la veracidad, calidad, contenido y realización efectiva de los eventos publicados.</li>
            <li>La Plataforma no garantiza la disponibilidad de los eventos, ni la exactitud de la información proporcionada por los Organizadores.</li>
            <li>El Responsable Fiscal no será responsable por cancelaciones, modificaciones, suspensiones o cualquier incumplimiento de los Organizadores, salvo en los casos expresamente previstos por la legislación argentina.</li>
            <li>El Usuario exonera al Responsable Fiscal y a la Plataforma de toda responsabilidad derivada de daños directos o indirectos resultantes del uso o imposibilidad de uso de la Plataforma.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold">6. Reembolsos y devoluciones</h2>
          <p>
            Los reembolsos o devoluciones se regirán por la política de reembolsos de Mercado Pago y las condiciones
            específicas establecidas por los Organizadores de cada evento.
          </p>
          <p>
            El Responsable Fiscal no se obliga a reintegrar montos abonados cuando la cancelación del evento sea ajena a su
            intervención o decisión. En caso de proceder, el reembolso será gestionado a través del mismo medio de pago
            utilizado por el Usuario.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold">7. Propiedad intelectual</h2>
          <p>
            Todo el contenido de la Plataforma —incluyendo, sin limitación, software, código fuente, diseño, logotipos,
            textos, imágenes, bases de datos y funcionalidades— constituye propiedad exclusiva de los Titulares y se encuentra
            protegido por las leyes de propiedad intelectual y derechos de autor (Ley N.º 11.723 y concordantes).
          </p>
          <p>Queda estrictamente prohibido cualquier uso, reproducción, distribución o modificación no autorizada del contenido de la Plataforma.</p>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold">8. Uso adecuado y prohibiciones</h2>
          <p>
            El Usuario se compromete a utilizar la Plataforma conforme a la ley, la moral y los presentes Términos. Queda
            expresamente prohibido:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-sm leading-relaxed text-muted-foreground">
            <li>Utilizar la Plataforma con fines ilícitos o fraudulentos.</li>
            <li>Interferir o vulnerar la seguridad del sistema.</li>
            <li>Realizar ingeniería inversa, extracción de datos o manipulación del software.</li>
            <li>Suplantar identidades o registrar cuentas falsas.</li>
          </ul>
          <p>
            El incumplimiento de las presentes disposiciones facultará al Responsable Fiscal a suspender o eliminar la cuenta
            del Usuario y, en su caso, iniciar las acciones legales correspondientes.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold">9. Protección de datos personales</h2>
          <p>
            La Plataforma cumple con la Ley N.º 25.326 de Protección de Datos Personales. Los datos suministrados por los
            Usuarios serán tratados con estricta confidencialidad y utilizados exclusivamente para los fines vinculados al
            funcionamiento del servicio.
          </p>
          <p>
            El titular de los datos podrá ejercer sus derechos de acceso, rectificación o supresión conforme a lo dispuesto en
            la normativa vigente, contactando a través de los canales oficiales indicados en la Plataforma.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold">10. Modificaciones de los Términos</h2>
          <p>
            Los presentes Términos podrán ser modificados o actualizados unilateralmente por el Responsable Fiscal, sin
            necesidad de notificación previa. Las modificaciones entrarán en vigencia a partir de su publicación en la
            Plataforma.
          </p>
          <p>El uso continuado de la Plataforma tras las modificaciones implicará la aceptación plena de los nuevos Términos.</p>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold">11. Jurisdicción y ley aplicable</h2>
          <p>
            Los presentes Términos se rigen por las leyes de la República Argentina. Toda controversia derivada de su
            interpretación o ejecución será sometida a la jurisdicción ordinaria de los tribunales de la Ciudad Autónoma de
            Buenos Aires, renunciando expresamente las partes a cualquier otro fuero o jurisdicción que pudiera
            corresponderles.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold">12. Contacto</h2>
          <p>
            Para cualquier consulta, notificación o ejercicio de derechos, los Usuarios podrán comunicarse mediante los
            canales de contacto habilitados en la Plataforma o al correo electrónico oficial:{' '}
            <Link href="mailto:administracion@tckt.fun" className="text-primary underline underline-offset-4">
              administracion@tckt.fun
            </Link>
            .
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold">13. Aceptación final</h2>
          <p>
            El acceso y uso de la Plataforma implica que el Usuario ha leído, comprendido y aceptado íntegramente los
            presentes Términos y Condiciones, sin que sea necesaria manifestación adicional.
          </p>
        </section>
      </article>
    </main>
  );
}
