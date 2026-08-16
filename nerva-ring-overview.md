# Nerva Ring — Product Overview

*Reference doc for development use. Last updated: July 12, 2026.*

## What It Is

Nerva Ring is a smart ring built to track physiological signals continuously and unobtrusively — heart rate, blood oxygen, and stress/arousal via galvanic skin response (GSR/EDA) — from a single wearable no bigger than a normal ring. It's an early-stage solo-built hardware project, currently in functional prototyping.

**Elevator pitch:** Most wearables measure your heart. Nerva also measures your nervous system — pairing HR/SpO2 with continuous EDA to give a fuller picture of stress, recovery, and arousal, all from your finger.

---

## Core Features

### Heart Rate & SpO2
Optical PPG sensing (MAXM86161-class sensor) reads pulse rate and blood oxygen saturation directly from the finger — one of the most vascularized, signal-rich sites on the body for this kind of sensing.

### Continuous Stress Tracking (GSR/EDA)
A dedicated analog front end measures galvanic skin response — the same signal used in polygraphs and clinical stress research — to track sympathetic nervous system arousal in real time. Two dry gold-plated electrodes built directly into the ring's flex PCB (no separate hardware) contact the skin on the inner band.

### All-Day Wear, Weeks of Battery
A duty-cycled wake-on-finger architecture means the ring isn't burning power on always-on sensing. It sleeps, checks briefly on a timer, and only spins up full sensing when a finger is actually detected — targeting roughly a month of standby life on a tiny 22mAh cell.

### Wireless Charging Contacts
Charges via a standard 2-pin pogo-pin dock connector — the same approach used across the smart ring industry — with circuit protection against sweat-related contact bridging.

### Bluetooth LE Connectivity
Built-in BLE radio (u-blox ANNA-B402 module) for syncing data to a companion app, with an antenna layout tuned for the ring's compact form factor.

### Sealed, Waterproof Build
The internal flex PCB assembly is fully potted in clear resin within the ring housing — no seams, no gaps, safe for continuous wear including hand-washing and showering.

---

## Under the Hood (Technical Summary)

| System | Approach |
|---|---|
| **Power management** | Single-chip PMIC (BQ25120A) providing a 1.8V rail for the MCU and a switched 3.3V rail for sensors, plus battery charging, monitoring, and load-switching — all from one IC to save board space |
| **LED drive** | A boost converter (evaluating TI TPS61240) steps up to the ~5V needed to drive the optical sensor's green LED, since the green channel needs more headroom than the red/IR channels |
| **Stress sensing (GSR AFE)** | Custom transimpedance-amplifier circuit built on a dual op-amp, tuned specifically for the low-current, low-noise signal range of skin conductance |
| **Optical sensor** | MAX30102-class HR/SpO2 sensor, run in a custom low-power polling mode rather than its stock continuous mode, to dramatically extend battery life |
| **MCU** | Low-power, BLE-capable microcontroller (final part TBD — leading candidates in the nRF52-class family) |
| **Radio** | u-blox ANNA-B402 BLE module with a tuned onboard antenna |
| **Mechanical build** | Custom Fusion 360 ring housing, flex PCB wrapped to the ring's inner circumference, resin-potted for a sealed waterproof shell |
| **Housing material** | Currently a cast resin prototype shell (SLA tooling); **production housing material not yet finalized** |
| **Battery** | 22mAh cell, sized to fit within the ring band |

---

## What Makes It Different

- **Two signal types most competitors don't combine at ring scale:** cardiovascular (HR/SpO2) *and* nervous-system (GSR) sensing in one device.
- **Purpose-built low-power firmware strategy** — rather than relying on a sensor's stock "always-on" detection mode (which drains most ring-sized batteries fast), Nerva uses a custom polling architecture to stretch battery life significantly further.
- **Solo-engineered, full-stack build** — mechanical, electrical, and firmware all designed in-house from first principles rather than assembled from an off-the-shelf reference design.

---

## Current Development Status

**In progress / prototyping phase.**

- ✅ Power architecture finalized (BQ25120A-based)
- ✅ GSR analog front end designed and tuned
- ✅ BLE module and antenna layout complete
- ✅ Mechanical housing and flex PCB wrap modeled in Fusion 360
- ✅ Resin-potting and waterproofing process defined
- 🔄 Boost converter for LED drive — being finalized
- 🔄 Final PCB layout and prototype assembly
- ⬜ Firmware implementation of full sensing pipeline
- ⬜ Functional prototype testing
- ⬜ Small-batch hand-assembled production run
- ⬜ Beta testing / crowdfunding phase (planned path to funding full production tooling)

---

## Notes for Claude Code

This file is a product-level summary, not a design source of truth. For circuit values, part numbers, register settings, and CAD specifics, defer to the actual project files (schematics, Fusion models, firmware source) — this doc will drift out of sync with those as the design evolves. Update this file when major architecture or feature decisions change, not for routine tuning.
