export type EnergyTip = {
  category: string
  tip: string
}

/**
 * Field-note facts used in two places: the landing-page carousel and the
 * appliance-list loading state. Keep them short, concrete, and useful to a
 * reader who's about to size a backup power system.
 */
export const ENERGY_TIPS: EnergyTip[] = [
  {
    category: 'Refrigeration',
    tip: 'A typical fridge sips about 1.5 kWh per day — the single biggest fixed load in most homes.',
  },
  {
    category: 'Lighting',
    tip: 'LED bulbs draw roughly 75% less power than incandescents and last 25 times longer.',
  },
  {
    category: 'Inverter sizing',
    tip: 'Inverter air conditioners can pull 2–3× their rated power at startup. Always size with headroom.',
  },
  {
    category: 'Solar yield',
    tip: 'A 400 W panel in a good sun-day returns around 2 kWh of usable energy after losses.',
  },
  {
    category: 'Battery health',
    tip: 'Lead-acid banks are typically sized to 50% depth-of-discharge to double their service life.',
  },
  {
    category: 'Phantom loads',
    tip: 'Standby loads — TVs, chargers, routers — can total 50–100 W around the clock. Count them in.',
  },
  {
    category: 'Laundry',
    tip: 'Washing machines spike on the heater element. Check whether yours uses a cold-water intake.',
  },
  {
    category: 'Cooling',
    tip: 'A ceiling fan at 75 W beats a 1,500 W air conditioner for short outages — comfort per watt.',
  },
  {
    category: 'Peak sun hours',
    tip: 'Usable sun hours average 4 to 6 per day depending on your region — your location decides panel count more than panel wattage does.',
  },
  {
    category: 'Shading',
    tip: 'Partial shade on a single panel can cut a whole string’s output by 60% or more. Mount where the sun is unobstructed, even at the edges of the day.',
  },
  {
    category: 'Lithium',
    tip: 'Lithium batteries safely discharge to 80% — nearly double the usable energy per amp-hour versus a lead-acid bank of the same nameplate.',
  },
  {
    category: 'Charge controllers',
    tip: 'MPPT controllers squeeze 25 to 30% more energy out of the same panels than PWM. On anything above a couple of panels, it pays back fast.',
  },
  {
    category: 'Hot water',
    tip: 'Electric water heaters at 3 to 5 kW each are the single largest home load. For backup power, isolate them from the inverter entirely.',
  },
  {
    category: 'Panel aging',
    tip: 'Panels degrade about 0.5% per year. Size for the output you’ll have in year 15, not year one, if you want the system to last.',
  },
  {
    category: 'Battery climate',
    tip: 'Battery usable capacity drops 10 to 20% in cold weather and shortens sharply in heat. Site the bank where it will neither freeze nor bake.',
  },
  {
    category: 'Load scheduling',
    tip: 'Running big loads one at a time can halve the inverter size you need. Stagger the kettle, the washing machine and the microwave.',
  },
]
