function HomePage() {
    const isAlertActive = true;

    return (
        <div>
            {!isAlertActive &&
                <div className="noAlertDiv">
                    <h1>אין כרגע התרעות באיזורך</h1>
                </div>
            }
            {isAlertActive &&
                <div>
                    <h1>יש התרעות באיזורך, נא להיכנס למרחב מוגן</h1>
                    <button>מצא מרחב מוגן קרוב</button>
                </div>
            }
            <p>©כל הזכויות שמורות לsafezoneai</p>
        </div>
    )
}

export default HomePage