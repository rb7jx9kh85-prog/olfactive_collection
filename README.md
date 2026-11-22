# Olfactive Collection

Boutique de décants Next.js 16, TypeScript, Tailwind CSS 4, Supabase PostgreSQL, Stripe Checkout **en mode test** et Resend. Interface publique et administration privée. Aucune référence, vente ou fiche client fictive n'est créée.

## Démarrage

```bash
npm ci
cp .env.example .env.local
npm run dev
```

La base Supabase liée est `hhmfzfmohtxasygrzvok` (région `eu-central-2`). Les quatre migrations dans `supabase/migrations/` sont déjà appliquées au projet lié. Pour un autre projet, appliquez-les dans l'ordre. La clé `sb_publishable_…` et l'URL sont publiques et préremplies dans `.env.example`. **Ne commitez jamais les secrets.**

Renseignez dans `.env.local` en local, puis dans les variables d'environnement Vercel :

| Nom | Utilité |
| --- | --- |
| `SUPABASE_SECRET_KEY` | Clé secrète Supabase, uniquement côté serveur (Settings → API Keys). |
| `STRIPE_SECRET_KEY` | Clé Stripe **`sk_test_…`** ; une clé de production est rejetée. |
| `STRIPE_WEBHOOK_SECRET` | Secret `whsec_…` du webhook de l'environnement test. |
| `RESEND_API_KEY` | Clé d'envoi Resend. |
| `RESEND_FROM_EMAIL` | Expéditeur sur un domaine vérifié chez Resend. |
| `NEXT_PUBLIC_SITE_URL` | Origine exacte du domaine de la boutique, sans slash final. |
| `CRON_SECRET` | Chaîne aléatoire forte pour protéger la maintenance. |
| `ADMIN_SETUP_TOKEN` | Code aléatoire d'au moins 32 caractères pour créer le premier admin. |

Générez les deux secrets aléatoires avec `openssl rand -hex 32` et gardez-les seulement dans le gestionnaire de secrets. Ouvrez `/admin/initialisation` une seule fois avec le code, un email et un mot de passe de 14 caractères minimum. Le compte Supabase Auth est confirmé et placé dans `admin_users` par une opération SQL qui n'autorise **qu'un premier admin**. Ensuite, supprimez `ADMIN_SETUP_TOKEN` de Vercel. Connectez-vous via `/admin/connexion`.

Dans Stripe **Test mode**, ajoutez un endpoint webhook sur `https://VOTRE-DOMAINE/api/stripe/webhook`, événements `checkout.session.completed` et `checkout.session.expired`. Le règlement n'est enregistré que si la signature, la session, le montant en CHF et le statut « paid » concordent. Les commandes `pending` ne comptent jamais dans les statistiques de ventes.

## Inventaire et paiement

- Créez de vrais parfums et leurs formats dans l'admin ; ajoutez des lots de flacons avec leur volume réel. Le catalogue reste vide jusque-là.
- Le navigateur ne transmet que des identifiants de formats et quantités. La fonction PostgreSQL `reserve_order` verrouille les variantes et lots, recalcule le total et débite les millilitres atomiquement ; un échec annule toute la transaction.
- Stripe Checkout reçoit le total vérifié par le serveur. Son webhook confirme une fois la commande et crée le client. En cas d'expiration, la réservation et l'utilisation du code promotionnel sont restituées.
- `/api/cron/reconcile` interroge Stripe avant de libérer une réservation ancienne et réessaie les emails en attente. `vercel.json` le lance quotidiennement pour rester compatible avec Vercel Hobby ; sur une offre autorisant les fréquences plus élevées, passez à `*/10 * * * *` pour raccourcir la reprise après échec d'un webhook. Le webhook d'expiration libère normalement le stock sans attendre ce contrôle.
- Les URL `/commande/<jeton>` sont privées par possession du jeton aléatoire. Ne les placez pas dans des liens publics.

## Vérification

```bash
npm test
npm run typecheck
npm run build
```

Les tests couvrent les entrées du panier, la livraison et le refus d'une session de paiement incohérente. Les tests de paiement bout en bout nécessitent les clés Stripe test, la clé secrète Supabase et un webhook Stripe configurés. Dans Stripe, utilisez uniquement des cartes de test. Pour contrôler les permissions SQL, la fonction `reserve_order` doit être exécutable par `service_role` et non par `anon`.

## Déploiement Vercel

Importez ce dépôt dans Vercel, configurez toutes les variables ci-dessus pour la production Vercel (Stripe reste en mode test), déployez, définissez `NEXT_PUBLIC_SITE_URL` sur l'URL finale et redéployez. Paramétrez le webhook Stripe test sur cette URL. Vérifiez le domaine d'envoi Resend. Ajoutez les premières références et les lots depuis l'admin. Aucun passage en paiement réel n'est activé par le code.
