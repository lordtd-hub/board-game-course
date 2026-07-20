from pathlib import Path
import json
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tmp" / "pdfs" / "sma2106-week1-2-question-bank.json"
OUTPUT = ROOT / "output" / "pdf" / "sma2106-week1-2-exam-review.pdf"

pdfmetrics.registerFont(TTFont("Tahoma", r"C:\Windows\Fonts\tahoma.ttf"))
pdfmetrics.registerFont(TTFont("Tahoma-Bold", r"C:\Windows\Fonts\tahomabd.ttf"))
pdfmetrics.registerFontFamily("Tahoma", normal="Tahoma", bold="Tahoma-Bold")

styles = getSampleStyleSheet()
title = ParagraphStyle("TitleTH", parent=styles["Title"], fontName="Tahoma-Bold", fontSize=24, leading=31, textColor=colors.HexColor("#0f6f72"), alignment=TA_CENTER, spaceAfter=12)
h1 = ParagraphStyle("H1TH", parent=styles["Heading1"], fontName="Tahoma-Bold", fontSize=17, leading=23, textColor=colors.HexColor("#0f6f72"), spaceBefore=8, spaceAfter=8)
h2 = ParagraphStyle("H2TH", parent=styles["Heading2"], fontName="Tahoma-Bold", fontSize=11.5, leading=16, textColor=colors.HexColor("#7a3828"), wordWrap="CJK", spaceBefore=7, spaceAfter=5)
body = ParagraphStyle("BodyTH", parent=styles["BodyText"], fontName="Tahoma", fontSize=10.5, leading=16, wordWrap="CJK", spaceAfter=4)
small = ParagraphStyle("SmallTH", parent=body, fontSize=8.5, leading=13, textColor=colors.HexColor("#5f584f"))
table_header = ParagraphStyle("TableHeaderTH", parent=small, fontName="Tahoma-Bold", textColor=colors.white)
answer = ParagraphStyle("AnswerTH", parent=body, backColor=colors.HexColor("#e6f6f2"), borderColor=colors.HexColor("#159a9c"), borderWidth=0.8, borderPadding=7, leading=15)

def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Tahoma", 8)
    canvas.setFillColor(colors.HexColor("#766d60"))
    canvas.drawString(18 * mm, 10 * mm, "SMA2106 - เอกสารตรวจทานข้อสอบสำหรับอาจารย์เท่านั้น")
    canvas.drawRightString(192 * mm, 10 * mm, f"หน้า {doc.page}")
    canvas.restoreState()

def P(text, style=body):
    safe = str(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return Paragraph(safe, style)

questions = json.loads(SOURCE.read_text(encoding="utf-8"))
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
doc = SimpleDocTemplate(str(OUTPUT), pagesize=A4, rightMargin=17*mm, leftMargin=17*mm, topMargin=16*mm, bottomMargin=18*mm, title="SMA2106 Week 1-2 Exam Review")
story = [
    Paragraph("SMA2106: ข้อสอบ Week 1-2", title),
    Paragraph("เอกสารตรวจทานสำหรับอาจารย์", h1),
    P("เวลา 60 นาที ข้อสอบจริง 24 ข้อ คะแนนเต็ม 24 คะแนน ระบบสุ่ม 1 ตัวแปรจากแต่ละจุดประสงค์การวัด รวมคลัง 72 ข้อ เอกสารนี้มีเฉลยและห้ามเผยแพร่แก่นักศึกษา"),
    Spacer(1, 6),
]

blueprint = [
    [P("ส่วน", table_header), P("จุดประสงค์", table_header), P("ตัวแปร", table_header), P("ข้อจริง", table_header)],
    [P("Week 1", body), P("12", body), P("36", body), P("12", body)],
    [P("Week 2", body), P("12", body), P("36", body), P("12", body)],
    [P("รวม", body), P("24", body), P("72", body), P("24", body)],
]
t = Table(blueprint, colWidths=[35*mm, 40*mm, 40*mm, 40*mm])
t.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#0f6f72")), ("TEXTCOLOR", (0,0), (-1,0), colors.white),
    ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#cbbd9f")), ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("BACKGROUND", (0,1), (-1,-1), colors.HexColor("#fffaf0")), ("LEFTPADDING", (0,0), (-1,-1), 7),
    ("RIGHTPADDING", (0,0), (-1,-1), 7), ("TOPPADDING", (0,0), (-1,-1), 6), ("BOTTOMPADDING", (0,0), (-1,-1), 6),
]))
story += [t, Spacer(1, 8), P("ระดับความยากของข้อสอบจริง: ง่าย 6 ข้อ ปานกลาง 12 ข้อ ยาก 6 ข้อ | ระดับการคิด: เข้าใจ 6 ประยุกต์ 12 วิเคราะห์ 6", small), PageBreak()]

letters = "ABCD"
for index, q in enumerate(questions):
    if index == 0 or q["week"] != questions[index - 1]["week"]:
        if index:
            story.append(PageBreak())
        story.append(Paragraph(f"Week {q['week']}", h1))
    choices = [P(f"{letters[i]}. {choice}", body) for i, choice in enumerate(q["choices"])]
    choice_table = Table([[choice] for choice in choices], colWidths=[166*mm])
    choice_table.setStyle(TableStyle([("LEFTPADDING", (0,0), (-1,-1), 8), ("BOTTOMPADDING", (0,0), (-1,-1), 3), ("TOPPADDING", (0,0), (-1,-1), 2)]))
    block = [
        Paragraph(f"{q['id']} | {q['topic']} | {q['difficulty']} | {q['cognitive']}", h2),
        P(q["prompt"]), choice_table,
        Paragraph(f"<b>เฉลย {letters[q['answer']]}</b> - {q['rationale']}", answer),
        P(f"แหล่งอ้างอิง: {q['source']}", small), Spacer(1, 7)
    ]
    story.append(KeepTogether(block))

doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
print(OUTPUT)
