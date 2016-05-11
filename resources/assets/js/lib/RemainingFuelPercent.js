export default function RemainingFuelPercent(counter, maxFuel = 130000) {
    let percent = 100

    if (counter < 0) {
        percent = 100 - ((counter * -1) / maxFuel * 100).toFixed(0)
        percent = percent < 0 ? 0 : percent
    }

    return percent
}
