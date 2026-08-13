/* ============================================================
   LE 831 — 火焱山 · main.js
   i18n (FR/EN/中文) · nav mobile · header sticky · tabs menu
   (données trilingues) · scroll reveal · utilitaires
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Données i18n ---------- */
  const META = {
    fr: {
      title: "Le 831 | Restaurant Ouïghour Halal — Paris 2e",
      desc: "Restaurant ouïghour halal à Paris. Brochettes d'agneau grillées, nouilles faites main, dapanji. Cuisine authentique d'Asie Centrale. 93 Bd de Sébastopol, 75002."
    },
    en: {
      title: "Le 831 | Uyghur Halal Restaurant — Paris 2nd",
      desc: "Uyghur halal restaurant in Paris. Grilled lamb skewers, handmade noodles, dapanji. Authentic Central Asian cuisine. 93 Bd de Sébastopol, 75002."
    },
    cn: {
      title: "Le 831 火焱山 | 巴黎维吾尔清真餐厅",
      desc: "巴黎清真维吾尔餐厅：炭火羊肉串、手工拉面、大盘鸡。正宗中亚美食。地址：巴黎塞瓦斯托波尔大道93号，75002。"
    }
  };

  const I18N = {
    fr: {
      "a11y.skip": "Aller au contenu",
      "nav.story": "Histoire", "nav.craft": "Savoir-faire", "nav.menu": "Menu",
      "nav.gallery": "Galerie", "nav.rooms": "Salons privés", "nav.contact": "Contact",
      "nav.reserve": "Réserver",
      "hero.kicker": "Restaurant Ouïghour Halal — Paris 2<sup>e</sup>",
      "hero.tagline": "Cuisine authentique d'Asie Centrale, au cœur de Paris",
      "hero.ctaMenu": "Découvrir la carte", "hero.ctaCall": "09 79 26 25 57",
      "hero.metro": "Métro Réaumur-Sébastopol · Lignes 3 &amp; 4",
      "hero.halal": "100&nbsp;% Halal", "hero.since": "Depuis 2020",
      "story.overline": "Notre histoire", "story.title": "Une table d'Asie Centrale",
      "story.titleAccent": "火焱山 · la montagne de feu",
      "story.p1": "Situé au cœur de Paris sur le Boulevard de Sébastopol, Le 831 vous invite à un voyage culinaire au cœur des traditions d'Asie Centrale. Nos chefs perpétuent un savoir-faire ancestral&nbsp;: nouilles tirées à la main, brochettes d'agneau grillées au feu de bois, ragoûts mijotés longuement. Chaque plat raconte l'histoire d'une culture préservée avec passion.",
      "story.f1": "Nouilles tirées à la main, faites minute",
      "story.f2": "Grillades au feu de bois",
      "story.f3": "Viandes 100&nbsp;% halal certifiées",
      "story.badgeTop": "Depuis",
      "story.sign": "— « la montagne de feu »",
      "craft.overline": "Savoir-faire", "craft.title": "Les nouilles tirées à la main",
      "craft.sub": "Quatre gestes, un héritage : chaque portion de nouilles naît sous vos yeux, de la pâte au wok.",
      "craft.s1t": "Le Pétrissage", "craft.s1d": "Farine, eau et savoir-faire — la pâte est pétrie jusqu'à la perfection élastique.",
      "craft.s2t": "Le Repos", "craft.s2d": "La pâte repose, couverte, pour développer son élasticité naturelle.",
      "craft.s3t": "Le Tirage", "craft.s3d": "Étirée, pliée, étirée encore — la pâte devient une centaine de filaments soyeux.",
      "craft.s4t": "La Dégustation", "craft.s4d": "Sautées au wok avec bœuf et légumes, chaque bouchée est un voyage.",
      "craft.alt1": "En cuisine, le chef prépare les ingrédients au couteau",
      "craft.alt2": "Les nouilles fraîches sont versées dans le wok bouillant",
      "craft.alt3": "Les nouilles plongent dans le wok avant le sautage",
      "craft.alt4": "Nouilles tirées à la main sautées au bœuf et poivrons, servies",
      "menu.overline": "La carte", "menu.title": "Le menu du 831",
      "menu.legendSpicy": "Épicé", "menu.legendVeggie": "Végétarien", "menu.legendSignature": "Signature",
      "menu.featured": "Plat signature · photo réelle",
      "banner.quote": "« Chaque plat raconte l'histoire d'une culture préservée avec passion. »",
      "gallery.overline": "Galerie", "gallery.title": "L'ambiance du 831",
      "gallery.cap1": "La salle", "gallery.cap2": "Table dressée", "gallery.cap3": "Lumières d'ambre",
      "gallery.cap4": "La terrasse", "gallery.cap5": "Détails", "gallery.cap6": "En cuisine",
      "gallery.cap7": "Le comptoir", "gallery.cap8": "Entre amis", "gallery.cap9": "La façade",
      "gallery.cap10": "Paris 2ᵉ",
      "gallery.open": "Agrandir la photo", "gallery.close": "Fermer",
      "gallery.prev": "Image précédente", "gallery.next": "Image suivante",
      "gallery.count": "Image {current} sur {total}",
      "gallery.hint": "Cliquez sur une photo pour ouvrir la galerie",
      "rooms.overline": "Salons privés", "rooms.title": "Karaoké &amp; salons privés",
      "rooms.sub": "Au sous-sol, deux salons insonorisés et climatisés équipés karaoké — pour vos soirées entre amis, anniversaires et repas d'équipe.",
      "rooms.jade": "Salon Jade", "rooms.jadeCap": "Jusqu'à 10 personnes", "rooms.jadeMin": "Minimum de consommation&nbsp;: 198&nbsp;€",
      "rooms.rubis": "Salon Rubis", "rooms.rubisCap": "Jusqu'à 15 personnes", "rooms.rubisMin": "Minimum de consommation&nbsp;: 238&nbsp;€",
      "rooms.featKtv": "Karaoké KTV", "rooms.featSound": "Insonorisé", "rooms.featAc": "Climatisé",
      "rooms.cta": "Réserver un salon", "rooms.note": "Sur réservation — 09 79 26 25 57",
      "contact.overline": "Contact &amp; accès", "contact.title": "Venez nous trouver",
      "contact.address": "Adresse", "contact.phone": "Téléphone",
      "contact.metroLabel": "Métro", "contact.metro": "Réaumur-Sébastopol — Lignes 3 &amp; 4",
      "contact.payLabel": "Paiements", "contact.pay": "Carte bancaire · Espèces · Tickets Restaurant",
      "contact.hoursTitle": "Horaires",
      "contact.daysWeek": "Lundi – Vendredi", "contact.daysWeekend": "Samedi – Dimanche",
      "contact.call": "Appeler le restaurant", "contact.directions": "Itinéraire ↗",
      "footer.tagline": "Cuisine authentique d'Asie Centrale, au cœur de Paris",
      "footer.rights": "Tous droits réservés.", "footer.top": "Haut de page ↑",
      "badge.spicy": "Épicé", "badge.veggie": "Végétarien", "badge.signature": "Signature"
    },
    en: {
      "a11y.skip": "Skip to content",
      "nav.story": "Our Story", "nav.craft": "Craftsmanship", "nav.menu": "Menu",
      "nav.gallery": "Gallery", "nav.rooms": "Private Rooms", "nav.contact": "Contact",
      "nav.reserve": "Book a table",
      "hero.kicker": "Uyghur Halal Restaurant — Paris 2<sup>nd</sup>",
      "hero.tagline": "Authentic Central Asian cuisine, in the heart of Paris",
      "hero.ctaMenu": "Explore the menu", "hero.ctaCall": "09 79 26 25 57",
      "hero.metro": "Metro Réaumur-Sébastopol · Lines 3 &amp; 4",
      "hero.halal": "100% Halal", "hero.since": "Since 2020",
      "story.overline": "Our Story", "story.title": "A Central Asian table",
      "story.titleAccent": "火焱山 · the mountain of fire",
      "story.p1": "Located in the heart of Paris on Boulevard de Sébastopol, Le 831 invites you on a culinary journey through Central Asian traditions. Our chefs carry on ancestral know-how: hand-pulled noodles, lamb skewers grilled over wood fire, slow-cooked stews. Every dish tells the story of a culture preserved with passion.",
      "story.f1": "Hand-pulled noodles, made to order",
      "story.f2": "Wood-fire grills",
      "story.f3": "100% certified halal meats",
      "story.badgeTop": "Since",
      "story.sign": "— “the mountain of fire”",
      "craft.overline": "Craftsmanship", "craft.title": "Hand-Pulled Noodles",
      "craft.sub": "Four gestures, one heritage: every portion of noodles is born before your eyes, from dough to wok.",
      "craft.s1t": "The Kneading", "craft.s1d": "Flour, water and know-how — the dough is kneaded to elastic perfection.",
      "craft.s2t": "The Rest", "craft.s2d": "The dough rests, covered, to develop its natural elasticity.",
      "craft.s3t": "The Stretch", "craft.s3d": "Stretched, folded, stretched again — the dough becomes a hundred silky strands.",
      "craft.s4t": "The Taste", "craft.s4d": "Wok-fried with beef and vegetables, every bite is a journey.",
      "craft.alt1": "In the kitchen, the chef prepares ingredients with a cleaver",
      "craft.alt2": "Fresh noodles are poured into the boiling wok",
      "craft.alt3": "The noodles plunge into the wok before frying",
      "craft.alt4": "Hand-pulled noodles wok-fried with beef and peppers, served",
      "menu.overline": "The Menu", "menu.title": "Le 831 Menu",
      "menu.legendSpicy": "Spicy", "menu.legendVeggie": "Vegetarian", "menu.legendSignature": "Signature",
      "menu.featured": "Signature dish · real photo",
      "banner.quote": "“Every dish tells the story of a culture preserved with passion.”",
      "gallery.overline": "Gallery", "gallery.title": "The 831 atmosphere",
      "gallery.cap1": "The dining room", "gallery.cap2": "Dressed table", "gallery.cap3": "Amber lights",
      "gallery.cap4": "The terrace", "gallery.cap5": "Details", "gallery.cap6": "In the kitchen",
      "gallery.cap7": "The counter", "gallery.cap8": "With friends", "gallery.cap9": "The storefront",
      "gallery.cap10": "Paris 2nd",
      "gallery.open": "Enlarge photo", "gallery.close": "Close",
      "gallery.prev": "Previous image", "gallery.next": "Next image",
      "gallery.count": "Image {current} of {total}",
      "gallery.hint": "Click a photo to open the gallery",
      "rooms.overline": "Private Rooms", "rooms.title": "Karaoke &amp; private rooms",
      "rooms.sub": "Downstairs, two soundproofed, air-conditioned karaoke rooms — for evenings with friends, birthdays and team dinners.",
      "rooms.jade": "Jade Room", "rooms.jadeCap": "Up to 10 guests", "rooms.jadeMin": "Minimum spend: €198",
      "rooms.rubis": "Ruby Room", "rooms.rubisCap": "Up to 15 guests", "rooms.rubisMin": "Minimum spend: €238",
      "rooms.featKtv": "KTV Karaoke", "rooms.featSound": "Soundproofed", "rooms.featAc": "Air-conditioned",
      "rooms.cta": "Book a room", "rooms.note": "By reservation — 09 79 26 25 57",
      "contact.overline": "Contact &amp; Access", "contact.title": "Come find us",
      "contact.address": "Address", "contact.phone": "Phone",
      "contact.metroLabel": "Metro", "contact.metro": "Réaumur-Sébastopol — Lines 3 &amp; 4",
      "contact.payLabel": "Payments", "contact.pay": "Credit card · Cash · Tickets Restaurant",
      "contact.hoursTitle": "Opening hours",
      "contact.daysWeek": "Monday – Friday", "contact.daysWeekend": "Saturday – Sunday",
      "contact.call": "Call the restaurant", "contact.directions": "Directions ↗",
      "footer.tagline": "Authentic Central Asian cuisine, in the heart of Paris",
      "footer.rights": "All rights reserved.", "footer.top": "Back to top ↑",
      "badge.spicy": "Spicy", "badge.veggie": "Vegetarian", "badge.signature": "Signature"
    },
    cn: {
      "a11y.skip": "跳到内容",
      "nav.story": "我们的故事", "nav.craft": "手工技艺", "nav.menu": "菜单",
      "nav.gallery": "图片", "nav.rooms": "私人包厢", "nav.contact": "联系我们",
      "nav.reserve": "电话预订",
      "hero.kicker": "清真维吾尔餐厅 — 巴黎第二区",
      "hero.tagline": "正宗中亚美食，位于巴黎市中心",
      "hero.ctaMenu": "查看菜单", "hero.ctaCall": "09 79 26 25 57",
      "hero.metro": "地铁 Réaumur-Sébastopol · 3号线与4号线",
      "hero.halal": "100% 清真", "hero.since": "始于2020年",
      "story.overline": "我们的故事", "story.title": "中亚风味餐桌",
      "story.titleAccent": "火焱山 · 火焰之山",
      "story.p1": "位于巴黎市中心的塞瓦斯托波尔大道，火焱山邀您踏上中亚传统美食之旅。我们的厨师传承古老技艺：手工拉面、木炭烤羊肉串、慢炖菜肴。每一道菜都讲述着一个被热情守护的文化故事。",
      "story.f1": "手工拉面，现点现做",
      "story.f2": "炭火烧烤",
      "story.f3": "100% 认证清真肉类",
      "story.badgeTop": "始于",
      "story.sign": "—「火焰之山」",
      "craft.overline": "手工技艺", "craft.title": "手工拉面",
      "craft.sub": "四个步骤，一份传承：每一份面条都在您眼前诞生，从面团到炒锅。",
      "craft.s1t": "揉面", "craft.s1d": "面粉、水和匠心——面团被揉至弹性完美。",
      "craft.s2t": "醒面", "craft.s2d": "面团覆盖静置，以发展其天然弹性。",
      "craft.s3t": "拉面", "craft.s3d": "拉伸、折叠、再拉伸——面团化作上百根丝滑的面条。",
      "craft.s4t": "品尝", "craft.s4d": "与牛肉和蔬菜在锅中翻炒，每一口都是一段旅程。",
      "craft.alt1": "厨房里，厨师用菜刀处理食材",
      "craft.alt2": "新鲜面条倒入沸腾的炒锅",
      "craft.alt3": "面条下锅准备翻炒",
      "craft.alt4": "手工拉面配牛肉和彩椒，已上桌",
      "menu.overline": "菜单", "menu.title": "火焱山菜单",
      "menu.legendSpicy": "辣", "menu.legendVeggie": "素食", "menu.legendSignature": "招牌",
      "menu.featured": "招牌菜 · 实拍照片",
      "banner.quote": "「每一道菜都讲述着一个被热情守护的文化故事。」",
      "gallery.overline": "图片", "gallery.title": "火焱山的氛围",
      "gallery.cap1": "大厅", "gallery.cap2": "摆台", "gallery.cap3": "琥珀灯光",
      "gallery.cap4": "露台", "gallery.cap5": "细节", "gallery.cap6": "厨房里",
      "gallery.cap7": "吧台", "gallery.cap8": "朋友相聚", "gallery.cap9": "门面",
      "gallery.cap10": "巴黎二区",
      "gallery.open": "放大照片", "gallery.close": "关闭",
      "gallery.prev": "上一张", "gallery.next": "下一张",
      "gallery.count": "第 {current} 张，共 {total} 张",
      "gallery.hint": "点击照片打开图库",
      "rooms.overline": "私人包厢", "rooms.title": "卡拉OK与私人包厢",
      "rooms.sub": "地下一层设有两个隔音、带空调的卡拉OK包厢——适合朋友聚会、生日和公司聚餐。",
      "rooms.jade": "翡翠厅", "rooms.jadeCap": "最多10人", "rooms.jadeMin": "最低消费：198 €",
      "rooms.rubis": "红宝石厅", "rooms.rubisCap": "最多15人", "rooms.rubisMin": "最低消费：238 €",
      "rooms.featKtv": "KTV 卡拉OK", "rooms.featSound": "隔音", "rooms.featAc": "空调",
      "rooms.cta": "预订包厢", "rooms.note": "需预订 — 09 79 26 25 57",
      "contact.overline": "联系与交通", "contact.title": "欢迎光临",
      "contact.address": "地址", "contact.phone": "电话",
      "contact.metroLabel": "地铁", "contact.metro": "Réaumur-Sébastopol — 3号线与4号线",
      "contact.payLabel": "支付方式", "contact.pay": "银行卡 · 现金 · 餐券",
      "contact.hoursTitle": "营业时间",
      "contact.daysWeek": "周一至周五", "contact.daysWeekend": "周六至周日",
      "contact.call": "致电餐厅", "contact.directions": "路线 ↗",
      "footer.tagline": "正宗中亚美食，位于巴黎市中心",
      "footer.rights": "版权所有。", "footer.top": "回到顶部 ↑",
      "badge.spicy": "辣", "badge.veggie": "素食", "badge.signature": "招牌"
    }
  };

  /* ---------- Données du menu (15 plats, trilingue) ---------- */
  const MENU = [
    {
      id: "entrees",
      label: { fr: "Entrées & Salades", en: "Appetizers & Salads", cn: "前菜与沙拉" },
      items: [
        {
          name: { fr: "Salade de concombre pimenté", en: "Spicy Cucumber Salad", cn: "凉拌黄瓜" },
          desc: {
            fr: "Concombre frais, ail, piment, vinaigre et huile de sésame",
            en: "Fresh cucumber, garlic, chili, vinegar and sesame oil",
            cn: "新鲜黄瓜、蒜、辣椒、醋和芝麻油"
          },
          price: "5,50 €", tags: ["veggie"]
        },
        {
          name: { fr: "Nems de bœuf", en: "Beef Spring Rolls", cn: "牛肉春卷" },
          desc: {
            fr: "Rouleaux croustillants farcis au bœuf épicé, sauce aigre-douce",
            en: "Crispy rolls filled with spiced beef, sweet and sour sauce",
            cn: "酥脆卷，内馅香辣牛肉，配酸甜酱"
          },
          price: "7,00 €", tags: ["spicy"]
        },
        {
          name: { fr: "Salade de chou épicée", en: "Spicy Cabbage Salad", cn: "辣拌卷心菜" },
          desc: {
            fr: "Chou râpé, carotte, coriandre, vinaigrette pimentée",
            en: "Shredded cabbage, carrot, cilantro, spicy dressing",
            cn: "卷心菜丝、胡萝卜、香菜、辣味调料"
          },
          price: "5,00 €", tags: ["veggie"]
        }
      ]
    },
    {
      id: "grillades",
      label: { fr: "Grillades & Brochettes", en: "Grills & Skewers", cn: "烧烤与串" },
      items: [
        {
          name: { fr: "Brochettes d'agneau (5 pièces)", en: "Lamb Skewers (5 pcs)", cn: "羊肉串（5串）" },
          desc: {
            fr: "Agneau mariné aux épices secrètes, grillé au feu de bois — notre spécialité",
            en: "Lamb marinated in secret spices, grilled over wood fire — our specialty",
            cn: "秘制香料腌制的羊肉，炭火烤制 — 我们的招牌"
          },
          price: "12,00 €", tags: ["spicy", "signature"]
        },
        {
          name: { fr: "Brochettes de poulet", en: "Chicken Skewers", cn: "鸡肉串" },
          desc: {
            fr: "Blanc de poulet mariné, grillé aux épices d'Asie Centrale",
            en: "Marinated chicken breast, grilled with Central Asian spices",
            cn: "腌制的鸡胸肉，配中亚香料烤制"
          },
          price: "10,00 €", tags: ["spicy"]
        },
        {
          name: { fr: "Poivrons et légumes grillés", en: "Grilled Peppers & Vegetables", cn: "烤蔬菜" },
          desc: {
            fr: "Légumes de saison grillés, huile d'olive et épices",
            en: "Seasonal grilled vegetables, olive oil and spices",
            cn: "时令烤蔬菜，橄榄油和香料"
          },
          price: "7,00 €", tags: ["veggie"]
        }
      ]
    },
    {
      id: "plats",
      label: { fr: "Plats Principaux", en: "Main Courses", cn: "主菜" },
      items: [
        {
          name: { fr: "Poulet aux pommes de terre (Dapanji)", en: "Chicken with Potatoes (Dapanji)", cn: "大盘鸡" },
          desc: {
            fr: "Ragoût de poulet mijoté, pommes de terre, poivrons, sauce épicée — notre plat signature",
            en: "Slow-cooked chicken stew, potatoes, peppers, spicy sauce — our signature dish",
            cn: "慢炖鸡肉、土豆、青椒、辣酱 — 我们的招牌菜"
          },
          price: "16,00 €", tags: ["spicy", "signature"]
        },
        {
          name: { fr: "Nouilles tirées à la main sauté au bœuf", en: "Hand-Pulled Noodles with Beef", cn: "牛肉拉面" },
          desc: {
            fr: "Nouilles fraîches faites maison, sauté au wok avec bœuf et légumes",
            en: "Fresh homemade hand-pulled noodles, wok-fried with beef and vegetables",
            cn: "新鲜手工拉面，与牛肉和蔬菜翻炒"
          },
          price: "14,00 €", tags: ["signature"],
          photo: {
            src: "assets/images/plat/nouilles-boeuf.jpg",
            alt: {
              fr: "Nouilles tirées à la main sautées au bœuf, poivrons rouges et verts",
              en: "Hand-pulled noodles wok-fried with beef, red and green peppers",
              cn: "牛肉手工拉面，配红绿彩椒"
            }
          }
        },
        {
          name: { fr: "Nouilles tirées à la main sauté à l'agneau", en: "Hand-Pulled Noodles with Lamb", cn: "羊肉拉面" },
          desc: {
            fr: "Nouilles fraîches maison sauté au wok avec agneau et oignons",
            en: "Fresh homemade hand-pulled noodles, wok-fried with lamb and onions",
            cn: "新鲜手工拉面，与羊肉和洋葱翻炒"
          },
          price: "15,00 €", tags: ["spicy"]
        },
        {
          name: { fr: "Riz pilaf à l'agneau (Polo)", en: "Lamb Pilaf (Polo)", cn: "羊肉抓饭" },
          desc: {
            fr: "Riz parfumé cuit avec agneau, carottes et épices d'Asie Centrale",
            en: "Fragrant rice cooked with lamb, carrots and Central Asian spices",
            cn: "香米饭，配羊肉、胡萝卜和中亚香料"
          },
          price: "13,00 €", tags: []
        },
        {
          name: { fr: "Raviolis ouïghours (Manta)", en: "Uyghur Dumplings (Manta)", cn: "薄皮包子" },
          desc: {
            fr: "Raviolis vapeur farcis à l'agneau et oignons, sauce vinaigre-piment",
            en: "Steamed dumplings filled with lamb and onions, vinegar-chili sauce",
            cn: "羊肉洋葱馅蒸饺，配醋辣酱"
          },
          price: "11,00 €", tags: ["signature"]
        }
      ]
    },
    {
      id: "pains",
      label: { fr: "Pains", en: "Breads", cn: "馕" },
      items: [
        {
          name: { fr: "Pain traditionnel (Nan)", en: "Traditional Naan Bread", cn: "传统烤馕" },
          desc: {
            fr: "Pain plat cuit au four, graines de sésame et épices",
            en: "Oven-baked flatbread with sesame seeds and spices",
            cn: "烤箱烤制的扁平面包，配芝麻和香料"
          },
          price: "3,00 €", tags: ["veggie"]
        },
        {
          name: { fr: "Nan à l'agneau", en: "Lamb Naan", cn: "羊肉烤馕" },
          desc: {
            fr: "Pain farci à l'agneau haché épicé, cuit au four",
            en: "Bread stuffed with spiced minced lamb, oven-baked",
            cn: "辣味碎羊肉馅烤馕"
          },
          price: "6,00 €", tags: ["spicy"]
        }
      ]
    },
    {
      id: "boissons",
      label: { fr: "Boissons", en: "Drinks", cn: "饮品" },
      items: [
        {
          name: { fr: "Thé d'Asie Centrale", en: "Central Asian Tea", cn: "中亚茶" },
          desc: {
            fr: "Thé noir parfumé importé directement d'Asie Centrale",
            en: "Fragrant black tea imported directly from Central Asia",
            cn: "从中亚直接进口的香浓红茶"
          },
          price: "3,50 €", tags: ["signature"]
        },
        {
          name: { fr: "Bière sans alcool au lait", en: "Non-Alcoholic Milk Beer", cn: "格瓦斯" },
          desc: {
            fr: "Boisson lactée pétillante traditionnelle — une spécialité unique",
            en: "Traditional sparkling milk drink — a unique specialty",
            cn: "传统气泡奶制饮品 — 独特特色"
          },
          price: "4,00 €", tags: []
        }
      ]
    }
  ];

  const TAG_META = {
    spicy: { icon: "🔥", key: "badge.spicy" },
    veggie: { icon: "🌿", key: "badge.veggie" },
    signature: { icon: "⭐", key: "badge.signature" }
  };

  /* ---------- État ---------- */
  const SUPPORTED = ["fr", "en", "cn"];
  let lang = "fr";
  try {
    const saved = localStorage.getItem("le831-lang");
    if (saved && SUPPORTED.includes(saved)) lang = saved;
    else {
      const nav = (navigator.language || "").slice(0, 2).toLowerCase();
      if (nav === "en" || nav === "zh") lang = nav === "zh" ? "cn" : nav;
    }
  } catch (e) { /* nav optimiseur */ }

  const t = (key) => (I18N[lang] && I18N[lang][key]) || I18N.fr[key] || key;

  /* ---------- Sélecteur de langue ---------- */
  function applyLang(next) {
    lang = next;
    const dict = I18N[lang];

    document.documentElement.lang = lang === "cn" ? "zh-CN" : lang;
    document.title = META[lang].title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", META[lang].desc);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.getAttribute("data-i18n-attr").split(",").forEach((pair) => {
        const [attr, key] = pair.split(":").map((s) => s.trim());
        if (attr && key && dict[key] !== undefined) el.setAttribute(attr, dict[key]);
      });
    });
    document.querySelectorAll(".lang-switch button").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
    });

    try { localStorage.setItem("le831-lang", lang); } catch (e) { /* ok */ }
    renderMenu();
    if (typeof refreshGallery === "function") refreshGallery();
  }

  document.querySelectorAll(".lang-switch button").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.lang !== lang) applyLang(btn.dataset.lang);
    });
  });

  /* ---------- Menu : tabs + panneaux ---------- */
  const tabsWrap = document.getElementById("menu-tabs");
  const panelsWrap = document.getElementById("menu-panels");
  let activeCat = MENU[0].id;

  function tagChips(tags) {
    return tags
      .map((tag) => {
        const m = TAG_META[tag];
        return `<span class="chip" role="img" aria-label="${t(m.key)}" title="${t(m.key)}">${m.icon}</span>`;
      })
      .join("");
  }

  function dishHTML(item) {
    const zhName = lang !== "cn" && item.name.cn ? `<span class="dish-cn" lang="zh">${item.name.cn}</span>` : "";
    if (item.photo) {
      return `
        <article class="dish dish-featured">
          <figure><img src="${item.photo.src}" alt="${item.photo.alt[lang] || item.photo.alt.fr}" loading="lazy" decoding="async"></figure>
          <div class="dish-body">
            <span class="featured-flag">${t("menu.featured")}</span>
            <h4 class="dish-name">${item.name[lang]}${zhName} <span class="dish-tags">${tagChips(item.tags)}</span></h4>
            <p class="dish-desc">${item.desc[lang]}</p>
            <p class="dish-price">${item.price}</p>
          </div>
        </article>`;
    }
    return `
      <article class="dish">
        <h4 class="dish-name">${item.name[lang]}${zhName} <span class="dish-tags">${tagChips(item.tags)}</span></h4>
        <p class="dish-desc">${item.desc[lang]}</p>
        <p class="dish-price">${item.price}</p>
      </article>`;
  }

  function renderMenu() {
    if (!tabsWrap || !panelsWrap) return;

    tabsWrap.innerHTML = MENU.map((cat) => {
      const zh = lang !== "cn" ? `<span class="zh" lang="zh">${cat.label.cn}</span>` : "";
      return `<button type="button" class="menu-tab" role="tab" id="tab-${cat.id}"
        aria-selected="${cat.id === activeCat}" aria-controls="panel-${cat.id}"
        tabindex="${cat.id === activeCat ? "0" : "-1"}">${cat.label[lang]}${zh}</button>`;
    }).join("");

    panelsWrap.innerHTML = MENU.map((cat) => `
      <div class="menu-panel" role="tabpanel" id="panel-${cat.id}" aria-labelledby="tab-${cat.id}"
        ${cat.id === activeCat ? "" : "hidden"} tabindex="0">
        ${cat.items.map(dishHTML).join("")}
      </div>`).join("");

    tabsWrap.querySelectorAll(".menu-tab").forEach((tab, idx) => {
      tab.addEventListener("click", () => selectTab(tab.id.replace("tab-", "")));
      tab.addEventListener("keydown", (e) => {
        const tabs = Array.from(tabsWrap.querySelectorAll(".menu-tab"));
        let next = null;
        if (e.key === "ArrowRight") next = tabs[(idx + 1) % tabs.length];
        if (e.key === "ArrowLeft") next = tabs[(idx - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") next = tabs[0];
        if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          selectTab(next.id.replace("tab-", ""));
          next.focus();
        }
      });
    });
  }

  function selectTab(id) {
    activeCat = id;
    tabsWrap.querySelectorAll(".menu-tab").forEach((tab) => {
      const on = tab.id === `tab-${id}`;
      tab.setAttribute("aria-selected", String(on));
      tab.setAttribute("tabindex", on ? "0" : "-1");
    });
    panelsWrap.querySelectorAll(".menu-panel").forEach((panel) => {
      panel.hidden = panel.id !== `panel-${id}`;
    });
  }

  /* ---------- Header sticky ---------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Navigation mobile ---------- */
  const toggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");
  let mobileNav = null;

  if (toggle && mainNav) {
    mobileNav = document.createElement("nav");
    mobileNav.className = "mobile-nav";
    mobileNav.id = "mobile-nav";
    mobileNav.setAttribute("aria-label", "Navigation mobile");
    mobileNav.innerHTML =
      Array.from(mainNav.querySelectorAll("a"))
        .map((a) => `<a href="${a.getAttribute("href")}" data-i18n="${a.getAttribute("data-i18n")}">${a.innerHTML}</a>`)
        .join("") +
      `<a class="btn btn-gold" href="tel:+33979262557" data-i18n="nav.reserve"></a>`;
    header.after(mobileNav);
    toggle.setAttribute("aria-controls", "mobile-nav");

    const closeNav = () => {
      mobileNav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    mobileNav.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1020) closeNav();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  revealEls.forEach((el, i) => {
    /* léger décalage en cascade au sein d'un même bloc */
    const siblings = el.parentElement ? el.parentElement.querySelectorAll(":scope > .reveal") : [el];
    el.style.setProperty("--d", `${(Array.from(siblings).indexOf(el) % 4) * 90}ms`);
  });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- Galerie : lightbox ---------- */
  const GALLERY = [
    { src: "assets/images/salle/vue-ensemble-01.jpg", cap: "gallery.cap1" },
    { src: "assets/images/deco/table-deco-01.jpg", cap: "gallery.cap2" },
    { src: "assets/images/salle/vue-ensemble-03.jpg", cap: "gallery.cap3" },
    { src: "assets/images/salle/terrasse.jpg", cap: "gallery.cap4" },
    { src: "assets/images/deco/table-deco-02.jpg", cap: "gallery.cap5" },
    { src: "assets/images/cuisine/prepa-nouilles-10.jpg", cap: "gallery.cap6" },
    { src: "assets/images/deco/detail-comptoir.jpg", cap: "gallery.cap7" },
    { src: "assets/images/deco/table-4pers.jpg", cap: "gallery.cap8" },
    { src: "assets/images/façade/façade-01.jpg", cap: "gallery.cap9" },
    { src: "assets/images/façade/façade-02.jpg", cap: "gallery.cap10" }
  ];

  const galleryGrid = document.getElementById("gallery-grid");
  const thumbnails = galleryGrid ? Array.from(galleryGrid.querySelectorAll(".gallery-item")) : [];

  let lightbox = null;
  let lightboxIndex = 0;
  let lightboxTrigger = null;
  let lightboxFocusable = [];

  function refreshGallery() {
    thumbnails.forEach((btn) => {
      const cap = GALLERY[parseInt(btn.dataset.index, 10)].cap;
      btn.setAttribute("aria-label", `${t("gallery.open")} — ${t(cap)}`);
    });
    if (lightbox && !lightbox.hidden) {
      const item = GALLERY[lightboxIndex];
      lightbox.querySelector(".lightbox-caption").textContent = t(item.cap);
      lightbox.querySelector(".lightbox-counter").setAttribute("aria-label",
        t("gallery.count").replace("{current}", lightboxIndex + 1).replace("{total}", GALLERY.length));
    }
  }

  function initGallery() {
    if (!galleryGrid) return;

    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.id = "gallery-lightbox";
    lightbox.hidden = true;
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("data-i18n-attr", "aria-label:gallery.title");
    lightbox.innerHTML = `
      <div class="lightbox-backdrop" data-lightbox-close></div>
      <div class="lightbox-shell">
        <button type="button" class="lightbox-btn lightbox-close" data-lightbox-close data-i18n-attr="aria-label:gallery.close">×</button>
        <figure class="lightbox-stage">
          <img class="lightbox-img" src="" alt="">
          <figcaption class="lightbox-caption" data-i18n=""></figcaption>
        </figure>
        <div class="lightbox-counter" aria-live="polite"></div>
        <button type="button" class="lightbox-btn lightbox-nav lightbox-prev" data-i18n-attr="aria-label:gallery.prev">←</button>
        <button type="button" class="lightbox-btn lightbox-nav lightbox-next" data-i18n-attr="aria-label:gallery.next">→</button>
      </div>`;
    document.body.appendChild(lightbox);

    lightboxFocusable = Array.from(lightbox.querySelectorAll("button"));

    const img = lightbox.querySelector(".lightbox-img");
    const caption = lightbox.querySelector(".lightbox-caption");
    const counter = lightbox.querySelector(".lightbox-counter");

    function render() {
      const item = GALLERY[lightboxIndex];
      img.src = item.src;
      img.alt = t(item.cap);
      caption.dataset.i18n = item.cap;
      caption.textContent = t(item.cap);
      counter.textContent = `${lightboxIndex + 1} / ${GALLERY.length}`;
      counter.setAttribute("aria-label",
        t("gallery.count").replace("{current}", lightboxIndex + 1).replace("{total}", GALLERY.length));
      img.classList.remove("lb-anim");
      void img.offsetWidth;
      img.classList.add("lb-anim");
    }

    function show(i) {
      lightboxIndex = (i + GALLERY.length) % GALLERY.length;
      render();
      lightbox.hidden = false;
      document.body.classList.add("no-scroll");
      lightbox.querySelector(".lightbox-close").focus();
    }

    function hide() {
      lightbox.hidden = true;
      document.body.classList.remove("no-scroll");
      if (lightboxTrigger && document.contains(lightboxTrigger)) lightboxTrigger.focus();
      lightboxTrigger = null;
    }

    const prev = () => show(lightboxIndex - 1);
    const next = () => show(lightboxIndex + 1);

    thumbnails.forEach((btn) => {
      btn.addEventListener("click", () => {
        lightboxTrigger = btn;
        show(parseInt(btn.dataset.index, 10));
      });
    });

    lightbox.querySelectorAll("[data-lightbox-close]").forEach((el) => el.addEventListener("click", hide));
    lightbox.querySelector(".lightbox-prev").addEventListener("click", prev);
    lightbox.querySelector(".lightbox-next").addEventListener("click", next);

    document.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      switch (e.key) {
        case "Escape": e.preventDefault(); hide(); break;
        case "ArrowLeft": e.preventDefault(); prev(); break;
        case "ArrowRight": e.preventDefault(); next(); break;
        case "Home": e.preventDefault(); show(0); break;
        case "End": e.preventDefault(); show(GALLERY.length - 1); break;
        case "Tab": {
          if (!lightboxFocusable.length) return;
          const first = lightboxFocusable[0];
          const last = lightboxFocusable[lightboxFocusable.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
          break;
        }
      }
    });

    const stage = lightbox.querySelector(".lightbox-stage");
    let touchX = 0, touchY = 0;
    stage.addEventListener("touchstart", (e) => {
      touchX = e.changedTouches[0].clientX;
      touchY = e.changedTouches[0].clientY;
    }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchX;
      const dy = e.changedTouches[0].clientY - touchY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
        dx < 0 ? next() : prev();
      }
    }, { passive: true });
  }

  initGallery();

  /* ---------- Divers ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Init */
  applyLang(lang); // aligne textes, menu et nav mobile (le FR statique sert de base SEO/no-JS)
})();
