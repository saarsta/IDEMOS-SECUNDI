/* LANGUAGE 
================================================== */
if(typeof VMM != 'undefined') {
	VMM.Language = {
		lang: "iw",
		right_to_left: true,
		api: {
			wikipedia: "he"
		},
		date: {
			month: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
			month_abbr: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
			day: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
			day_abbr: ["א","ב", "ג", "ד", "ה", "ו", "ש"]
		}, 
		dateformats: {
			year: "yyyy",
			month_short: "mmm",
			month: "mmmm yyyy",
			full_short: "d 'ב'mmm",
			full: "d 'ב'mmmm yyyy",
			time_no_seconds_short: "h:MM TT",
			time_no_seconds_small_date: "h:MM TT'<br/><small>'d 'ב'mmmm yyyy'</small>'",
			full_long: "d 'ב'mmmm yyyy 'בשעה' h:MM TT",
			full_long_small_date: "h:MM TT'<br/><small>'d 'ב'mmmm yyyy'</small>'"
		},
		messages: {
			loading_timeline: "טוען ציר זמן... ",
			return_to_title: "חזור להתחלה",
			expand_timeline: "הגדל ציר זמן",
			contract_timeline: "הקטן ציר זמן",
			wikipedia: "מתוך ויקיפדיה, האנציקלופדיה החופשית",
			loading_content: "טוען תוכן",
			loading: "טוען"
		}
	}
}