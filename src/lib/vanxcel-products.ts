export interface VanXcelProduct {
  sku: string;
  name: string;
  category: 'converter' | 'battery' | 'solar' | 'cable' | 'fuse' | 'safety' | 'accessory' | 'panel';
  price: number;
  inStock: boolean;
  comingSoon: boolean;
  shopUrl: string | null;
  specs: Record<string, string | number | boolean>;
  /** i18n key for the configurator use description, e.g. "configurator.pu_VX1000CV" */
  configuratorUse: string;
}

export const vanxcelProducts: VanXcelProduct[] = [
  // === CONVERTERS ===
  {
    sku: 'VX1000CV',
    name: 'VanXcel 5-in-1 Converter 1000W',
    category: 'converter',
    price: 375,
    inStock: true,
    comingSoon: false,
    shopUrl: '/shop/vanxcel-5-in-1-converter-1000w',
    specs: {
      continuousW: 1000, peakW: 2000, dcDcAmps: 25, solarMaxW: 500, solarMaxA: 25,
      solarVoltageRange: '14-50V DC', acInput: '230V', upsSwitch: '25ms',
      batteryTypes: 'STD, GEL, AGM, CAL, LiFePO4', fuseRequired: 200,
      includedCables: '2x 16mm² met M8 kabelschoenen', weight: 4.8,
      dimensions: '38 x 11 x 21 cm',
    },
    configuratorUse: 'Voor systemen tot 1000W continu. Ideaal voor weekend campers en lichtere setups.'
  },
  {
    sku: 'VX1500CV',
    name: 'VanXcel 5-in-1 Converter 1500W',
    category: 'converter',
    price: 475,
    inStock: true,
    comingSoon: false,
    shopUrl: '/shop/vanxcel-5-in-1-converter-1500w',
    specs: {
      continuousW: 1500, peakW: 3000, dcDcAmps: 25, solarMaxW: 500, solarMaxA: 25,
      solarVoltageRange: '14-50V DC', acInput: '230V', upsSwitch: '25ms',
      batteryTypes: 'STD, GEL, AGM, CAL, LiFePO4', fuseRequired: 250,
      includedCables: '2x 16mm² met M8 kabelschoenen', weight: 5.4,
      dimensions: '40 x 11.5 x 22.5 cm',
    },
    configuratorUse: 'Voor systemen tot 1500W continu. De populairste keuze voor actieve campers en full-timers.'
  },
  {
    sku: 'VX3000CV',
    name: 'VanXcel 5-in-1 Converter 3000W',
    category: 'converter',
    price: 699,
    inStock: false,
    comingSoon: true,
    shopUrl: null,
    specs: { continuousW: 3000, peakW: 6000, dcDcAmps: 25, solarMaxW: 500, solarMaxA: 25, fuseRequired: 400 },
    configuratorUse: 'Voor zware systemen met inductiekookplaat of meerdere grote 230V verbruikers.'
  },

  // === BATTERIES ===
  {
    sku: 'VXBAT100S',
    name: 'VanXcel 100Ah LiFePO4 Slim',
    category: 'battery',
    price: 299,
    inStock: false,
    comingSoon: true,
    shopUrl: null,
    specs: { capacityAh: 100, voltage: 12.8, type: 'LiFePO4', form: 'slim-line' },
    configuratorUse: 'Compacte batterij voor onder de stoel. Past in de meeste VW T6 en Ducato stoelconsoles.'
  },
  {
    sku: 'VXBAT200',
    name: 'VanXcel 200Ah LiFePO4 Accu',
    category: 'battery',
    price: 445,
    inStock: true,
    comingSoon: false,
    shopUrl: '/shop/vanxcel-200ah-lifepo4-accu',
    specs: { capacityAh: 200, voltage: 12.8, type: 'LiFePO4', form: 'standard' },
    configuratorUse: 'Onze populairste batterij. Perfecte balans tussen capaciteit en prijs.'
  },
  {
    sku: 'VXBAT300',
    name: 'VanXcel 300Ah LiFePO4 Accu',
    category: 'battery',
    price: 697,
    inStock: false,
    comingSoon: false,
    shopUrl: '/shop/vanxcel-300ah-lifepo4-accu',
    specs: { capacityAh: 300, voltage: 12.8, type: 'LiFePO4', form: 'standard' },
    configuratorUse: 'Voor uitgebreide systemen en full-time vanlife. Maximale capaciteit in één batterij.'
  },

  // === SOLAR ===
  {
    sku: 'VXSOL150',
    name: 'VanXcel 150W Vast Zonnepaneel',
    category: 'solar',
    price: 150,
    inStock: false,
    comingSoon: false,
    shopUrl: '/shop/vanxcel-150w-vast-zonnepaneel',
    specs: { wattage: 150, type: 'mono', connector: 'MC4' },
    configuratorUse: 'Compact paneel, ideaal voor kleinere daken of als aanvulling.'
  },
  {
    sku: 'VXSOL200',
    name: 'VanXcel 200W Vast Zonnepaneel',
    category: 'solar',
    price: 179,
    inStock: false,
    comingSoon: true,
    shopUrl: null,
    specs: { wattage: 200, type: 'mono', connector: 'MC4' },
    configuratorUse: 'Het standaard paneel voor camper builds. Sluit direct aan op de VanXcel Converter via MC4.'
  },

  // === CABLES ===
  { sku: 'VXCAB2.5R', name: 'VanXcel Kabel 2,5mm² Rood', category: 'cable', price: 4.95, inStock: true, comingSoon: false, shopUrl: '/shop/vanxcel-kabel-2-5-mm2-rood', specs: { size_mm2: 2.5, color: 'rood', priceUnit: 'per meter' }, configuratorUse: 'Voor lichte 12V circuits: LED verlichting, sensoren.' },
  { sku: 'VXCAB2.5Z', name: 'VanXcel Kabel 2,5mm² Zwart', category: 'cable', price: 4.95, inStock: true, comingSoon: false, shopUrl: '/shop/vanxcel-kabel-2-5-mm2-zwart', specs: { size_mm2: 2.5, color: 'zwart', priceUnit: 'per meter' }, configuratorUse: 'Negatieve kabel voor lichte 12V circuits.' },
  { sku: 'VXCAB6SR', name: 'VanXcel Solarkabel 6mm² Rood', category: 'cable', price: 5.95, inStock: true, comingSoon: false, shopUrl: '/shop/vanxcel-kabel-6mm2-zonne-energie-rood', specs: { size_mm2: 6, color: 'rood', type: 'solar', priceUnit: 'per meter' }, configuratorUse: 'Solarkabel van paneel naar converter. UV-bestendig.' },
  { sku: 'VXCAB6SZ', name: 'VanXcel Solarkabel 6mm² Zwart', category: 'cable', price: 5.95, inStock: true, comingSoon: false, shopUrl: '/shop/vanxcel-kabel-6mm2-zonne-energie-zwart', specs: { size_mm2: 6, color: 'zwart', type: 'solar', priceUnit: 'per meter' }, configuratorUse: 'Negatieve solarkabel.' },
  { sku: 'VXCAB10R', name: 'VanXcel Kabel 10mm² Rood', category: 'cable', price: 8.95, inStock: false, comingSoon: true, shopUrl: null, specs: { size_mm2: 10, color: 'rood', priceUnit: 'per meter' }, configuratorUse: 'Voor middelzware circuits en korte alternator runs.' },
  { sku: 'VXCAB10Z', name: 'VanXcel Kabel 10mm² Zwart', category: 'cable', price: 8.95, inStock: false, comingSoon: true, shopUrl: null, specs: { size_mm2: 10, color: 'zwart', priceUnit: 'per meter' }, configuratorUse: 'Negatieve kabel voor middelzware circuits.' },
  { sku: 'VXCAB16R', name: 'VanXcel Kabel 16mm² Rood', category: 'cable', price: 10.95, inStock: false, comingSoon: true, shopUrl: null, specs: { size_mm2: 16, color: 'rood', priceUnit: 'per meter' }, configuratorUse: 'Voor alternator aansluiting en middelzware hoofd-circuits.' },
  { sku: 'VXCAB16Z', name: 'VanXcel Kabel 16mm² Zwart', category: 'cable', price: 10.95, inStock: false, comingSoon: true, shopUrl: null, specs: { size_mm2: 16, color: 'zwart', priceUnit: 'per meter' }, configuratorUse: 'Negatieve kabel voor middelzware circuits.' },
  { sku: 'VXCAB25R', name: 'VanXcel Kabel 25mm² Rood', category: 'cable', price: 13.95, inStock: false, comingSoon: true, shopUrl: null, specs: { size_mm2: 25, color: 'rood', priceUnit: 'per meter' }, configuratorUse: 'Aarding naar chassis en zwaardere circuits.' },
  { sku: 'VXCAB25Z', name: 'VanXcel Kabel 25mm² Zwart', category: 'cable', price: 13.95, inStock: false, comingSoon: true, shopUrl: null, specs: { size_mm2: 25, color: 'zwart', priceUnit: 'per meter' }, configuratorUse: 'Aarding naar chassis.' },
  { sku: 'VXCAB35R', name: 'VanXcel Kabel 35mm² Rood', category: 'cable', price: 16.95, inStock: true, comingSoon: false, shopUrl: '/shop/vanxcel-kabel-35-mm2-rood', specs: { size_mm2: 35, color: 'rood', priceUnit: 'per meter' }, configuratorUse: 'Zware batterijkabel voor omvormers tot 2000W.' },
  { sku: 'VXCAB35Z', name: 'VanXcel Kabel 35mm² Zwart', category: 'cable', price: 16.95, inStock: true, comingSoon: false, shopUrl: '/shop/vanxcel-kabel-35-mm2-zwart', specs: { size_mm2: 35, color: 'zwart', priceUnit: 'per meter' }, configuratorUse: 'Negatieve batterijkabel.' },
  { sku: 'VXCAB50R', name: 'VanXcel Kabel 50mm² Rood', category: 'cable', price: 19.95, inStock: true, comingSoon: false, shopUrl: '/shop/vanxcel-kabel-50mm2-rood', specs: { size_mm2: 50, color: 'rood', priceUnit: 'per meter' }, configuratorUse: 'Zwaarste batterijkabel. Voor omvormers 2000W+ en korte runs.' },
  { sku: 'VXCAB50Z', name: 'VanXcel Kabel 50mm² Zwart', category: 'cable', price: 19.95, inStock: true, comingSoon: false, shopUrl: '/shop/vanxcel-kabel-50mm2-zwart', specs: { size_mm2: 50, color: 'zwart', priceUnit: 'per meter' }, configuratorUse: 'Negatieve kabel voor zwaarste circuits.' },

  // === FUSES ===
  { sku: 'VXFUSE100', name: 'VanXcel Automatische Zekering 100A', category: 'fuse', price: 26.95, inStock: true, comingSoon: false, shopUrl: '/shop/vanxcel-automatische-zekering-100a', specs: { rating: 100, type: 'automatic_breaker' }, configuratorUse: 'Resetbare zekering voor middelzware circuits.' },
  { sku: 'VXFUSE150', name: 'VanXcel Automatische Zekering 150A', category: 'fuse', price: 23.95, inStock: true, comingSoon: false, shopUrl: '/shop/vanxcel-automatische-zekering-150a', specs: { rating: 150, type: 'automatic_breaker' }, configuratorUse: 'Resetbare zekering voor zwaardere circuits.' },
  { sku: 'VXANL200', name: 'VanXcel ANL Zekering 200A + Houder', category: 'fuse', price: 18.95, inStock: false, comingSoon: true, shopUrl: null, specs: { rating: 200, type: 'ANL' }, configuratorUse: 'Hoofdzekering voor de VanXcel 1000W Converter. Plaatsen binnen 18cm van batterij+.' },
  { sku: 'VXANL250', name: 'VanXcel ANL Zekering 250A + Houder', category: 'fuse', price: 18.95, inStock: false, comingSoon: true, shopUrl: null, specs: { rating: 250, type: 'ANL' }, configuratorUse: 'Hoofdzekering voor de VanXcel 1500W Converter. Plaatsen binnen 18cm van batterij+.' },
  { sku: 'VXFH12', name: 'VanXcel Zekeringhouder 12 Sleuven', category: 'fuse', price: 31.95, inStock: true, comingSoon: false, shopUrl: '/shop/vanxcel-zekeringhouder-12-sleuven', specs: { slots: 12, type: 'blade_fuse_box' }, configuratorUse: 'Zekeringkast voor al je 12V circuits. 12 slots voor individuele verbruikers.' },
  { sku: 'VXFH6', name: 'VanXcel Zekeringhouder 6 Sleuven', category: 'fuse', price: 19.95, inStock: true, comingSoon: false, shopUrl: '/shop/vanxcel-zekeringhouder-6-sleuven', specs: { slots: 6, type: 'blade_fuse_box' }, configuratorUse: 'Compacte zekeringkast voor eenvoudige setups met minder circuits.' },
  { sku: 'VXFUSEPACK', name: 'VanXcel Pack-Zekeringen (blade fuses)', category: 'fuse', price: 7.49, inStock: false, comingSoon: false, shopUrl: '/shop/vanxcel-pack-zekeringen', specs: { type: 'blade_fuse_assortment' }, configuratorUse: 'Assortiment blade fuses (5A, 10A, 15A, 20A, 30A) voor je zekeringkast.' },

  // === SAFETY ===
  { sku: 'VXSWITCH200', name: 'VanXcel Manuele Batterij Schakelaar 200A', category: 'safety', price: 19.95, inStock: true, comingSoon: false, shopUrl: '/shop/vanxcel-manuele-batterij-schakelaar-200a', specs: { rating: 200, type: 'manual_disconnect' }, configuratorUse: 'Noodschakelaar. Schakelt het hele systeem uit. Plaatsen direct na de ANL zekering.' },
  { sku: 'VXRELAY140', name: 'VanXcel Automatisch Relais 140A', category: 'safety', price: 39.95, inStock: true, comingSoon: false, shopUrl: '/shop/vanxcel-automatisch-relais-140a', specs: { rating: 140, type: 'voltage_sensitive_relay' }, configuratorUse: 'Alleen voor voertuigen met conventionele alternator (Euro 5). NIET geschikt voor smart alternators.' },
  { sku: 'VXBUSBAR', name: 'VanXcel Negatieve Busbar 6-weg', category: 'safety', price: 14.95, inStock: false, comingSoon: true, shopUrl: null, specs: { connections: 6, type: 'negative_busbar' }, configuratorUse: 'Centraal punt voor alle negatieve kabels. Verbind met 25mm²+ naar chassis-aarding.' },

  // === ACCESSORIES ===
  { sku: 'VXDAKDV', name: 'VanXcel Dubbele Kabelwartel Dak', category: 'accessory', price: 12.95, inStock: false, comingSoon: false, shopUrl: '/shop/vanxcel-dubbele-kabelwartel-dak', specs: { type: 'roof_cable_gland', entries: 2 }, configuratorUse: 'Waterdichte dakdoorvoer voor solarkabels. Dubbele doorvoer voor + en - kabel.' },
  { sku: 'VXFIREWALL', name: 'VanXcel Kabelwartel Firewall', category: 'accessory', price: 7.95, inStock: false, comingSoon: false, shopUrl: '/shop/vanxcel-kabelwartel-firewall', specs: { type: 'firewall_cable_gland' }, configuratorUse: 'Doorvoer voor kabels door scheidingswanden. Waterdicht en trillingbestendig.' },
  { sku: 'VXSOLMOUNT', name: 'VanXcel Zonnepaneel Montagekit', category: 'accessory', price: 24.95, inStock: false, comingSoon: false, shopUrl: '/shop/vanxcel-zonnepaneel-montagekit', specs: { type: 'solar_mounting_kit' }, configuratorUse: 'Montagebeugels en spoilers voor het bevestigen van zonnepanelen op het dak.' },
  { sku: 'VXKRIMP', name: 'VanXcel Krimpkous Verpakking', category: 'accessory', price: 12.95, inStock: false, comingSoon: false, shopUrl: '/shop/vanxcel-krimpkous-verpakking', specs: { type: 'heatshrink_assortment' }, configuratorUse: 'Krimpkous voor het isoleren en beschermen van kabelverbindingen.' },
  { sku: 'VXBINDERS', name: 'VanXcel Kabelbinders Pakket', category: 'accessory', price: 6.95, inStock: false, comingSoon: false, shopUrl: '/shop/vanxcel-kabelbinders-pakket', specs: { type: 'cable_ties' }, configuratorUse: 'Kabelbinders voor het vastzetten van kabels elke 30-50cm.' },
  { sku: 'VXRING35', name: 'VanXcel Ringklemmen 35mm² Pakket', category: 'accessory', price: 17.95, inStock: false, comingSoon: false, shopUrl: '/shop/vanxcel-ringklemmen-35mm2-pakket', specs: { type: 'ring_terminals', size_mm2: 35 }, configuratorUse: 'Kabelschoenen voor 35mm² kabels. Gebruik met hydraulische krimptang.' },
  { sku: 'VXRINGPACK', name: 'VanXcel Ring Terminals Pakket', category: 'accessory', price: 17.95, inStock: false, comingSoon: false, shopUrl: '/shop/vanxcel-ring-terminals-pakket', specs: { type: 'ring_terminal_assortment' }, configuratorUse: 'Assortiment kabelschoenen voor diverse kabeldiktes.' },
  { sku: 'VXSHUNT', name: 'VanXcel Battery Monitor Shunt', category: 'accessory', price: 69.95, inStock: false, comingSoon: true, shopUrl: null, specs: { rating: 500, type: 'battery_shunt', bluetooth: true }, configuratorUse: 'Houdt je batterijstatus (SOC%) bij via Bluetooth app. Essentieel voor LiFePO4.' },
  { sku: 'VXCEE16', name: 'VanXcel CEE-16A Walstroom Inlet + 10m Kabel', category: 'accessory', price: 54.95, inStock: false, comingSoon: true, shopUrl: null, specs: { type: 'shore_power_inlet', rating: '16A', cableLength: '10m' }, configuratorUse: 'Buitenmontage walstroom aansluiting. Sluit aan op AC IN van de converter voor laden op campings.' },

  // === PANELS ===
  { sku: 'VXPANEL5', name: 'VanXcel Schakelpaneel 5 Sleuven', category: 'panel', price: 23.95, inStock: true, comingSoon: false, shopUrl: '/shop/vanxcel-schakelpaneel-5-sleuven', specs: { switches: 5, type: 'switch_panel' }, configuratorUse: 'Schakelpaneel met 5 individuele schakelaars + voltmeter. Mooi inbouwpaneel voor je dashboard.' },
  { sku: 'VXPLUG230', name: 'VanXcel 230V EU-Stekkerdoos 2-pack', category: 'accessory', price: 21.95, inStock: true, comingSoon: false, shopUrl: '/shop/vanxcel-230v-eu-stekkerdoos-2-pack', specs: { type: 'outlet_230v', count: 2 }, configuratorUse: 'Inbouw 230V stopcontacten voor in je bus. Sluit aan op de AC OUT van de converter.' },
  { sku: 'VXUSB2', name: 'VanXcel USB-Wandstekker 2-pack', category: 'accessory', price: 19.95, inStock: true, comingSoon: false, shopUrl: '/shop/vanxcel-usb-wandstekker-2-pack', specs: { type: 'usb_outlet', count: 2 }, configuratorUse: 'Inbouw USB oplaadpunten. Direct op 12V aansluiten (geen omvormer nodig).' },
];

export function getProduct(sku: string): VanXcelProduct | undefined {
  return vanxcelProducts.find(p => p.sku === sku);
}

export function getProductsByCategory(category: VanXcelProduct['category']): VanXcelProduct[] {
  return vanxcelProducts.filter(p => p.category === category);
}

/**
 * Returns the live price for a product, or undefined if not available.
 * Coming-soon products will not have a live price.
 */
export function getLivePrice(
  sku: string,
  priceMap: Map<string, number>
): number | undefined {
  return priceMap.get(sku);
}

/**
 * Returns the display price for a product:
 * - Live price if available from SellQo
 * - 0 for coming-soon products (to hide price in UI)
 * - Hardcoded fallback otherwise
 */
export function getDisplayPrice(
  product: VanXcelProduct,
  priceMap: Map<string, number>
): number {
  if (product.comingSoon) return 0;
  return priceMap.get(product.sku) ?? product.price;
}
