import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { getCourseDetails } from "@/queries/courses";
import { getLoggedInUser } from "@/lib/loggedin-user";
import { getReport } from "@/queries/reports";

import { formatMyDate } from "@/lib/date";

export async function GET(request) {
  try {
    /* -----------------
     *
     * Configuratios
     *
     *-------------------*/
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");
    const course = await getCourseDetails(courseId);
    const loggedInUser = await getLoggedInUser();

    const report = await getReport({
      course: courseId,
      student: loggedInUser.id,
    });

    const completionDate = report?.completion_date
      ? formatMyDate(report?.completion_date)
      : formatMyDate(Date.now());

    const completionInfo = {
      name: `${loggedInUser?.firstName} ${loggedInUser?.lastName}`,
      completionDate: completionDate,
      courseName: course.title,
      instructor: `${course?.instructor?.firstName} ${course?.instructor?.lastName}`,
      instructorDesignation: `${course?.instructor?.designation}`,
      sign: "/sign.png",
    };

    const pdfDoc = await PDFDocument.create();

    // Sử dụng chỉ font tiêu chuẩn
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(
      StandardFonts.HelveticaBold,
    );

    const page = pdfDoc.addPage([841.89, 595.28]);
    const { width, height } = page.getSize();

    /* -----------------
     *
     * Logo
     *
     *-------------------*/
    try {
      const logoUrl = new URL("/logo.png", "http://localhost:3000").toString();
      const logoBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
      const logo = await pdfDoc.embedPng(logoBytes);
      const logoDimns = logo.scale(0.5);
      page.drawImage(logo, {
        x: width / 2 - logoDimns.width / 2,
        y: height - 120,
        width: logoDimns.width,
        height: logoDimns.height,
      });
    } catch (error) {
      console.error("Could not load logo:", error);
    }

    /* -----------------
     *
     * Title
     *
     *-------------------*/
    const titleFontSize = 30;
    const titleText = "Certificate Of Completion";
    // title text width
    const titleTextWidth = helveticaBoldFont.widthOfTextAtSize(
      titleText,
      titleFontSize,
    );

    page.drawText("Certificate Of Completion", {
      x: width / 2 - titleTextWidth / 2,
      y: height - 180,
      size: titleFontSize,
      font: helveticaBoldFont,
      color: rgb(0, 0.53, 0.71),
    });

    /* -----------------
     *
     * Name Label
     *
     *-------------------*/
    const nameLabelText = "This certificate is hereby bestowed upon";
    const nameLabelFontSize = 20;
    // title text width
    const nameLabelTextWidth = helveticaFont.widthOfTextAtSize(
      nameLabelText,
      nameLabelFontSize,
    );

    page.drawText(nameLabelText, {
      x: width / 2 - nameLabelTextWidth / 2,
      y: height - 220,
      size: nameLabelFontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    /* -----------------
     *
     * Name
     *
     *-------------------*/
    const nameText = completionInfo.name;
    const nameFontSize = 40;
    // title text width
    const nameTextWidth = timesRomanFont.widthOfTextAtSize(
      nameText,
      nameFontSize,
    );

    page.drawText(nameText, {
      x: width / 2 - nameTextWidth / 2,
      y: height - 270,
      size: nameFontSize,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    /* -----------------
     *
     * Details Info
     *
     *-------------------*/
    const detailsText = `This is to certify that ${completionInfo.name} successfully completed the ${completionInfo.courseName} course on ${completionInfo.completionDate} by ${completionInfo.instructor}`;
    const detailsFontSize = 16;

    page.drawText(detailsText, {
      x: width / 2 - 700 / 2,
      y: height - 330,
      size: detailsFontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
      maxWidth: 700,
      wordBreaks: [" "],
    });

    /* -----------------
     *
     * Signatures
     *
     *-------------------*/
    const signatureBoxWidth = 300;
    page.drawText(completionInfo.instructor, {
      x: width - signatureBoxWidth,
      y: 90,
      size: detailsFontSize,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(completionInfo.instructorDesignation, {
      x: width - signatureBoxWidth,
      y: 72,
      size: 10,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
      maxWidth: 250,
    });
    page.drawLine({
      start: { x: width - signatureBoxWidth, y: 110 },
      end: { x: width - 60, y: 110 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    /* -----------------
     *
     * Generate and send Response
     *
     *-------------------*/
    const pdfBytes = await pdfDoc.save();
    return new Response(pdfBytes, {
      headers: { "content-type": "application/pdf" },
    });
  } catch (error) {
    console.log(error);
    // Trả về lỗi
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
