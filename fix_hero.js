const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/home/Hero.tsx', 'utf8');
code = code.replace(
  '          </div>                  </div>      </div>    </section>  );}',
  '          </div>        </div>      </div>    </section>  );}'
);
fs.writeFileSync('frontend/src/components/home/Hero.tsx', code);
