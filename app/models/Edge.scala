package models

import scala.util.Random

import play.api.libs.json._

case class Edge(srcId: Int, tgtId: Int){

  val rand = new Random
  val value: Int = 2 + rand.nextInt(6)
  val highlight: Int = 0
  def source = srcId
  def target = tgtId

  def toDict() = {
    Json.obj(
      "source" -> this.srcId,
      "target" -> this.tgtId,
      "value" -> this.value
    )
  }

}
